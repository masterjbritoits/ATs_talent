import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

// GET  /api/applications/[id]/slots  — list slots
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  const slots = await prisma.schedulingSlot.findMany({
    where: { applicationId: id },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json(slots);
}

// POST /api/applications/[id]/slots  — create slot(s)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;

  let body: { slots: { startsAt: string; endsAt: string; location?: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.slots) || body.slots.length === 0) {
    return NextResponse.json({ error: "slots array required" }, { status: 400 });
  }

  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const created = await prisma.schedulingSlot.createMany({
    data: body.slots.map((s) => ({
      applicationId: id,
      startsAt: new Date(s.startsAt),
      endsAt: new Date(s.endsAt),
      location: s.location ?? null,
    })),
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entityType: "Application",
      entityId: id,
      action: "SLOTS_CREATED",
      metadataJson: { count: created.count },
    },
  });

  return NextResponse.json({ created: created.count }, { status: 201 });
}
