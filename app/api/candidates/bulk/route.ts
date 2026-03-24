import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { EmailDraftResult } from "@/lib/types";
import { bulkCandidateSchema } from "@/lib/validators/candidate";
import { generateEmailDraft } from "@/server/services/email-suggestions/service";

export async function POST(request: NextRequest) {
  const body = bulkCandidateSchema.parse(await request.json());
  await prisma.candidate.updateMany({
    where: { id: { in: body.candidateIds } },
    data: {
      status: body.status,
      assignedRecruiterId: body.recruiterId,
      isInTalentPool: body.talentPool
    }
  });

  let drafts: EmailDraftResult[] = [];
  if (body.templateType) {
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: body.candidateIds } },
      include: { applications: { include: { job: true } } }
    });
    drafts = await Promise.all(
      candidates.map((candidate) =>
        generateEmailDraft(body.templateType!, {
          candidateName: candidate.fullName,
          jobTitle: candidate.applications[0]?.job?.title ?? "ITSector opportunity",
          recruiterName: "Joana"
        })
      )
    );
  }

  await prisma.auditLog.create({
    data: {
      entityType: "Candidate",
      entityId: body.candidateIds.join(","),
      action: "bulk_action",
      metadataJson: body
    }
  });

  return NextResponse.json({ ok: true, drafts });
}
