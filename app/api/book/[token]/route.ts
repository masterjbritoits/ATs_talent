import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// POST /api/book/[token]  — public, no auth — candidate books a slot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const slot = await prisma.schedulingSlot.findUnique({ where: { token } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  if (slot.isBooked) return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });

  // Mark as booked
  await prisma.schedulingSlot.update({
    where: { token },
    data: { isBooked: true, bookedAt: new Date() },
  });

  // Audit
  await prisma.auditLog.create({
    data: {
      entityType: "SchedulingSlot",
      entityId: slot.id,
      action: "SLOT_BOOKED",
      metadataJson: { applicationId: slot.applicationId },
    },
  });

  return NextResponse.json({ ok: true });
}
