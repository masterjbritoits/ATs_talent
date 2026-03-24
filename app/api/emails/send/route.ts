import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { sendGraphEmail } from "@/lib/graph/client";
import { generateEmailDraft } from "@/server/services/email-suggestions/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const candidate = await prisma.candidate.findUnique({
    where: { id: body.candidateId },
    include: { applications: { include: { job: true } } }
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const draft =
    body.subject && body.body
      ? { subject: body.subject, body: body.body, provider: "manual" }
      : await generateEmailDraft(body.templateType, {
          candidateName: candidate.fullName,
          jobTitle: candidate.applications[0]?.job?.title ?? "ITSector opportunity",
          recruiterName: "Joana",
          dateTime: body.dateTime
        });

  if (process.env.MICROSOFT_CLIENT_SECRET) {
    await sendGraphEmail({
      to: [candidate.primaryEmail],
      subject: draft.subject,
      body: draft.body
    });
  }

  const email = await prisma.emailMessage.create({
    data: {
      candidateId: candidate.id,
      applicationId: candidate.applications[0]?.id,
      graphMessageId: `local-outbound-${Date.now()}`,
      direction: "OUTBOUND",
      fromAddress: process.env.MICROSOFT_USER_EMAIL ?? "careers@itsector.pt",
      toAddressesJson: [candidate.primaryEmail],
      ccAddressesJson: [],
      subject: draft.subject,
      bodyText: draft.body,
      sentAt: new Date(),
      processedAt: new Date(),
      rawHeadersJson: { provider: draft.provider }
    }
  });

  await prisma.auditLog.create({
    data: {
      entityType: "EmailMessage",
      entityId: email.id,
      action: "email_sent",
      metadataJson: body
    }
  });

  return NextResponse.json({ ok: true, draft, emailId: email.id });
}
