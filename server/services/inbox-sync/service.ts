import { CandidateStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { listMailboxMessages } from "@/lib/graph/client";
import { MailSyncResult, MailboxMessageInput } from "@/lib/types";
import { JobRepository } from "@/server/repositories/job-repository";
import { processAttachment } from "@/server/services/attachment-processing/service";
import {
  extractCandidateFromEmail,
  extractCandidateFromText
} from "@/server/services/candidate-extraction/service";
import { classifyRecruitmentEmail } from "@/server/services/email-classification/service";
import { refreshJobRanking, rescoreApplication } from "@/server/services/scoring/service";

function detectLikelyJob(subject: string, jobs: Awaited<ReturnType<JobRepository["listOpen"]>>) {
  const lower = subject.toLowerCase();
  return jobs.find((job) => lower.includes(job.title.toLowerCase())) ?? null;
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

function mapGraphResponseToMessages(response: any): MailboxMessageInput[] {
  return (response?.value ?? []).map((item: any) => ({
    graphMessageId: item.id,
    internetMessageId: item.internetMessageId,
    conversationId: item.conversationId,
    subject: item.subject ?? "(No subject)",
    fromAddress: item.from?.emailAddress?.address ?? "unknown@unknown.local",
    toAddresses: (item.toRecipients ?? []).map((recipient: any) => recipient.emailAddress?.address),
    ccAddresses: (item.ccRecipients ?? []).map((recipient: any) => recipient.emailAddress?.address),
    bodyText: item.bodyPreview,
    bodyHtml: item.body?.content,
    receivedAt: item.receivedDateTime,
    rawHeaders: item.internetMessageHeaders,
    attachments: []
  }));
}

export async function runMailboxSync(messagesOverride?: MailboxMessageInput[]): Promise<MailSyncResult> {
  const beforeEmails = await prisma.emailMessage.count();
  const beforeCandidates = await prisma.candidate.count();
  const beforeApplications = await prisma.application.count();
  const messages =
    messagesOverride ??
    mapGraphResponseToMessages(await listMailboxMessages().catch(() => ({ value: [] })));

  let importedMessages = 0;
  for (const message of messages) {
    const imported = await persistMessage(message);
    if (imported) importedMessages += 1;
  }

  const afterCandidates = await prisma.candidate.count();
  const afterApplications = await prisma.application.count();
  const afterEmails = await prisma.emailMessage.count();

  return {
    importedMessages,
    skippedMessages: Math.max(0, messages.length - importedMessages),
    candidatesCreated: Math.max(0, afterCandidates - beforeCandidates),
    candidatesUpdated: Math.max(0, importedMessages - Math.max(0, afterCandidates - beforeCandidates)),
    applicationsCreated: Math.max(0, afterApplications - beforeApplications)
  };
}
