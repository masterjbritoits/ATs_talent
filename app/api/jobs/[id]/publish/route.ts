import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

const VALID_BOARDS = ["LINKEDIN", "SAPO", "NET_EMPREGOS", "CAREERS_PORTAL"];

// POST /api/jobs/[id]/publish   body: { board: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  let body: { board: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!VALID_BOARDS.includes(body.board)) {
    return NextResponse.json(
      { error: `board must be one of: ${VALID_BOARDS.join(", ")}` },
      { status: 400 }
    );
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const post = await prisma.jobBoardPost.upsert({
    where: { jobId_board: { jobId: id, board: body.board } },
    create: {
      jobId: id,
      board: body.board,
      status: "PUBLISHED",
      postedAt: new Date(),
    },
    update: {
      status: "PUBLISHED",
      postedAt: new Date(),
      removedAt: null,
      errorMsg: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entityType: "Job",
      entityId: id,
      action: "JOB_PUBLISHED",
      metadataJson: { board: body.board },
    },
  });

  return NextResponse.json(post, { status: 201 });
}

// DELETE /api/jobs/[id]/publish   body: { board: string }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  let body: { board: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await prisma.jobBoardPost.updateMany({
    where: { jobId: id, board: body.board },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
