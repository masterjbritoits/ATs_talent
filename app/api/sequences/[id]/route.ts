import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

// GET /api/sequences/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  const seq = await prisma.emailSequence.findUnique({ where: { id } });
  if (!seq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(seq);
}

// PATCH /api/sequences/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  let body: Partial<{ name: string; triggerStage: string; steps: unknown[]; isActive: boolean }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updated = await prisma.emailSequence.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.triggerStage && { triggerStage: body.triggerStage }),
      ...(body.steps && { stepsJson: body.steps as object[] }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/sequences/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  await prisma.emailSequence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
