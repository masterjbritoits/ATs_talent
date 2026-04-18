import { CandidateStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { listMailboxMessages, getAttachmentContent } from "@/lib/graph/client";
import { MailSyncResult, MailboxMessageInput } from "@/lib/types";
import { JobRepository } from "@/server/repositories/job-repository";
import { processAttachment } from "@/server/services/attachment-processing/service";
import {
  extractCandidateFromEmail,
  extractCandidateFromText
} from "@/server/services/candidate-extraction/service";
import { classifyRecruitmentEmail } from "@/server/services/email-classification/service";
import { refreshJobRanking, rescoreApplication } from "@/server/services/scoring/service";

const SUPPORTED_ATTACHMENT_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/octet-stream"
]);

function detectLikelyJob(subject: string, jobs: Awaited<ReturnType<JobRepository["listOpen"]>>) {
  const lower = subject.toLowerCase();
  return jobs.find((job) => lower.includes(job.title.toLowerCase())) ?? null;
}

/**
 * Fetches real attachment content for a Graph message item.
 * Skips inline images and unsupported MIME types.
 */
async function resolveAttachments(
  messageId: string,
  rawAttachments: any[]
): Promise<MailboxMessageInput["attachments"]> {
  const results: MailboxMessageInput["attachments"] = [];

  for (const att of rawAttachments ?? []) {
    if (att.isInline) continue;
    const ext = (att.name ?? "").split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext ?? "")) continue;

    const content = await getAttachmentContent(messageId, att.id).catch(() => null);
    if (!content) continue;

    results.push({
      filename: att.name,
      contentType: content.contentType,
      contentBytes: content.contentBytes
    });
  }

  return results;
}

async function persistMessage(message: MailboxMessageInput) {
  const existing = await prisma.emailMessage.findUnique({
    where: { graphMessageId: message.graphMessageId }
  });
  if (existing) {
    return false;
  }

  const jobs = await new JobRepository().listOpen();
  const classification = classifyRecruitmentEmail({
    subject: message.subject,
    fromAddress: message.fromAddress,
    bodyText: message.bodyText,
    attachmentNames: message.attachments.map((attachment) => attachment.filename)
  });

  let parsedText = message.bodyText ?? "";
  const attachmentRecords = [];
  for (const attachment of message.attachments) {
    if (!/\.(pdf|docx?)$/i.test(attachment.filename)) continue;
    const processed = await processAttachment({
      fileName: attachment.filename,
      contentType: attachment.contentType,
      base64Content: attachment.contentBytes,
      candidateKey: message.graphMessageId
    });
    attachmentRecords.push(processed);
    parsedText += `\n${processed.parsedText}`;
  }

  const parsedProfile =
    parsedText.trim().length > 50
      ? extractCandidateFromText({
          text: parsedText,
          fallbackEmail: message.fromAddress,
          senderEmail: message.fromAddress
        })
      : extractCandidateFromEmail({
          subject: message.subject,
          bodyText: message.bodyText ?? "",
          senderEmail: message.fromAddress
        });

  const job = detectLikelyJob(message.subject, jobs);
  const candidate = await prisma.candidate.upsert({
    where: { primaryEmail: parsedProfile.primaryEmail ?? message.fromAddress },
    create: {
      fullName: parsedProfile.fullName,
      primaryEmail: parsedProfile.primaryEmail ?? message.fromAddress,
      phone: parsedProfile.phone,
      linkedinUrl: parsedProfile.linkedinUrl,
      githubUrl: parsedProfile.githubUrl,
      location: parsedProfile.location,
      country: parsedProfile.country,
      currentTitle: parsedProfile.currentTitle,
      summary: parsedProfile.summary,
      yearsExperience: parsedProfile.yearsExperience,
      parsedSkillsJson: parsedProfile.skills,
      parsedLanguagesJson: parsedProfile.languages,
      parsedEducationJson: parsedProfile.education,
      parsedExperienceJson: parsedProfile.workHistory,
      domainSignalsJson: parsedProfile.domainSignals,
      sourceType: classification,
      status: CandidateStatus.NEW,
      confidenceScore: Math.round(parsedProfile.confidence * 100)
    },
    update: {
      fullName: parsedProfile.fullName,
      phone: parsedProfile.phone,
      linkedinUrl: parsedProfile.linkedinUrl,
      githubUrl: parsedProfile.githubUrl,
      location: parsedProfile.location,
      country: parsedProfile.country,
      currentTitle: parsedProfile.currentTitle,
      summary: parsedProfile.summary,
      yearsExperience: parsedProfile.yearsExperience,
      parsedSkillsJson: parsedProfile.skills,
      parsedLanguagesJson: parsedProfile.languages,
      parsedEducationJson: parsedProfile.education,
      parsedExperienceJson: parsedProfile.workHistory,
      domainSignalsJson: parsedProfile.domainSignals,
      confidenceScore: Math.round(parsedProfile.confidence * 100)
    }
  });

  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job?.id,
      source: classification,
      status: "NEW",
      appliedAt: message.receivedAt ? new Date(message.receivedAt) : new Date(),
      scoreBreakdownJson: {},
      rationaleJson: {}
    }
  });

  const email = await prisma.emailMessage.create({
    data: {
      candidateId: candidate.id,
      applicationId: application.id,
      graphMessageId: message.graphMessageId,
      internetMessageId: message.internetMessageId,
      conversationId: message.conversationId,
      direction: "INBOUND",
      fromAddress: message.fromAddress,
      toAddressesJson: message.toAddresses,
      ccAddressesJson: message.ccAddresses,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      receivedAt: message.receivedAt ? new Date(message.receivedAt) : undefined,
      processedAt: new Date(),
      rawHeadersJson: { ...(message.rawHeaders ?? {}), classification }
    }
  });

  await Promise.all(
    attachmentRecords.map((record) =>
      prisma.attachment.create({
        data: {
          ...record,
          candidateId: candidate.id,
          applicationId: application.id,
          emailMessageId: email.id
        }
      })
    )
  );

  if (job) {
    await rescoreApplication(candidate.id, job, application.id);
    await refreshJobRanking(job.id);
  }

  return true;
}

/**
 * Maps a Graph API message response item to the internal MailboxMessageInput
 * format. Attachment content is NOT fetched here; call resolveAttachments()
 * separately for messages that have hasAttachments = true.
 */
function mapGraphItemToMessage(item: any): MailboxMessageInput & { _graphAttachments: any[] } {
  return {
    graphMessageId: item.id,
    internetMessageId: item.internetMessageId,
    conversationId: item.conversationId,
    subject: item.subject ?? "(No subject)",
    fromAddress: item.from?.emailAddress?.address ?? "unknown@unknown.local",
    toAddresses: (item.toRecipients ?? []).map((r: any) => r.emailAddress?.address),
    ccAddresses: (item.ccRecipients ?? []).map((r: any) => r.emailAddress?.address),
    bodyText: item.bodyPreview,
    bodyHtml: item.body?.content,
    receivedAt: item.receivedDateTime,
    rawHeaders: item.internetMessageHeaders,
    // Inline attachment metadata from $expand — content fetched separately
    attachments: [],
    _graphAttachments: item.hasAttachments ? (item.attachments ?? []) : []
  };
}

export async function runMailboxSync(messagesOverride?: MailboxMessageInput[]): Promise<MailSyncResult> {
  const beforeEmails = await prisma.emailMessage.count();
  const beforeCandidates = await prisma.candidate.count();
  const beforeApplications = await prisma.application.count();

  let rawMessages: (MailboxMessageInput & { _graphAttachments?: any[] })[] = [];

  if (messagesOverride) {
    rawMessages = messagesOverride;
  } else {
    // Read current delta link from settings for incremental sync
    const deltaSettings = await prisma.systemSetting.findUnique({
      where: { key: "graph_delta_link" }
    });
    const deltaLink = (deltaSettings?.valueJson as any)?.link as string | undefined;

    const response = await listMailboxMessages({ deltaLink }).catch(() => ({ value: [] as any[], "@odata.deltaLink": undefined }));
    rawMessages = (response.value ?? []).map(mapGraphItemToMessage);

    // Persist updated delta link for next sync
    const nextDelta = (response as any)["@odata.deltaLink"];
    if (nextDelta) {
      await prisma.systemSetting.upsert({
        where: { key: "graph_delta_link" },
        create: { key: "graph_delta_link", valueJson: { link: nextDelta } },
        update: { valueJson: { link: nextDelta } }
      });
    }
  }

  let importedMessages = 0;
  for (const rawMessage of rawMessages) {
    // Fetch real attachment content from Graph for messages that have them
    const graphAttachments: any[] = (rawMessage as any)._graphAttachments ?? [];
    if (graphAttachments.length > 0) {
      rawMessage.attachments = await resolveAttachments(
        rawMessage.graphMessageId,
        graphAttachments
      );
    }

    try {
      const imported = await persistMessage(rawMessage);
      if (imported) importedMessages += 1;
    } catch (err) {
      // Log and continue — one bad message should not abort the full sync
      console.error(`[inbox-sync] Failed to persist message ${rawMessage.graphMessageId}:`, err);
    }
  }

  const afterCandidates = await prisma.candidate.count();
  const afterApplications = await prisma.application.count();

  // Update last sync timestamp
  await prisma.systemSetting.upsert({
    where: { key: "last_sync_at" },
    create: { key: "last_sync_at", valueJson: { at: new Date().toISOString() } },
    update: { valueJson: { at: new Date().toISOString() } }
  }).catch(() => {/* non-critical */});

  return {
    importedMessages,
    skippedMessages: Math.max(0, rawMessages.length - importedMessages),
    candidatesCreated: Math.max(0, afterCandidates - beforeCandidates),
    candidatesUpdated: Math.max(0, importedMessages - Math.max(0, afterCandidates - beforeCandidates)),
    applicationsCreated: Math.max(0, afterApplications - beforeApplications)
  };
}
