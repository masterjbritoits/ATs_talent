import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

// GET /api/sequences
export async function GET() {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const seqs = await prisma.emailSequence.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(seqs);
}

// POST /api/sequences
export async function POST(req: NextRequest) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  let body: { name: string; triggerStage: string; steps: unknown[]; isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !body.triggerStage || !Array.isArray(body.steps)) {
    return NextResponse.json(
      { error: "name, triggerStage and steps are required" },
      { status: 400 }
    );
  }

  const seq = await prisma.emailSequence.create({
    data: {
      name: body.name,
      triggerStage: body.triggerStage,
      stepsJson: body.steps as object[],
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(seq, { status: 201 });
}
