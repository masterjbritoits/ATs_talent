import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUserOrUnauthorized } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

const NOTE_TYPES = ["GENERAL", "INTERVIEW_FEEDBACK", "CONCERN", "REFERENCE"] as const;

const schema = z.object({
  note: z.string().min(1).max(5000),
  noteType: z.enum(NOTE_TYPES).default("GENERAL"),
  tags: z.array(z.string().max(40)).max(10).default([])
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  const notes = await prisma.recruiterNote.findMany({
    where: { candidateId: id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(notes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({ where: { id }, select: { id: true } });
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { note, noteType, tags } = parsed.data;

  const created = await prisma.recruiterNote.create({
    data: {
      candidateId: id,
      authorId: user!.id,
      note,
      noteType,
      tagsJson: tags
    },
    include: { author: { select: { id: true, name: true } } }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user!.id,
      entityType: "Candidate",
      entityId: id,
      action: "NOTE_ADDED",
      metadataJson: { noteType, noteId: created.id }
    }
  });

  return NextResponse.json(created, { status: 201 });
}
