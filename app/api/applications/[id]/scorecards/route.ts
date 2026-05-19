import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

// GET /api/applications/[id]/scorecards
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  const scorecards = await prisma.interviewScorecard.findMany({
    where: { applicationId: id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(scorecards);
}

// POST /api/applications/[id]/scorecards
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;

  let body: {
    interviewType: string;
    scores: Record<string, number>;
    overallScore: number;
    recommendation: string;
    notes?: string;
    interviewEventId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { interviewType, scores, overallScore, recommendation, notes, interviewEventId } = body;

  if (!interviewType || !scores || overallScore == null || !recommendation) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["ADVANCE", "HOLD", "REJECT"].includes(recommendation)) {
    return NextResponse.json({ error: "Invalid recommendation" }, { status: 400 });
  }

  if (overallScore < 0 || overallScore > 100) {
    return NextResponse.json({ error: "overallScore must be 0–100" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const scorecard = await prisma.interviewScorecard.create({
    data: {
      applicationId: id,
      interviewEventId: interviewEventId ?? null,
      authorId: user.id,
      interviewType,
      scoresJson: scores,
      overallScore,
      recommendation,
      notes: notes ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entityType: "Application",
      entityId: id,
      action: "SCORECARD_SUBMITTED",
      metadataJson: { interviewType, overallScore, recommendation },
    },
  });

  return NextResponse.json(scorecard, { status: 201 });
}
