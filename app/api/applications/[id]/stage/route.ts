import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline";

const VALID_STAGES = new Set(PIPELINE_STAGES.map((s) => s.value));

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;

  let body: { stage?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const newStage = body.stage;
  if (!newStage || !VALID_STAGES.has(newStage)) {
    return NextResponse.json(
      { error: `Invalid stage. Valid values: ${[...VALID_STAGES].join(", ")}` },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: { candidate: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const previousStage = application.status;

  // Update application and candidate status atomically
  await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data:  { status: newStage as never },
    }),
    prisma.candidate.update({
      where: { id: application.candidateId },
      data:  { status: newStage as never },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId:  user.id,
        entityType:   "Application",
        entityId:     id,
        action:       "STAGE_TRANSITION",
        metadataJson: {
          from:        previousStage,
          to:          newStage,
          note:        body.note ?? null,
          candidateId: application.candidateId,
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, previousStage, newStage });
}
