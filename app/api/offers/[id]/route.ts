import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

const VALID_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];

// PATCH /api/offers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;

  let body: { status?: string; salary?: string; startDate?: string; benefits?: string[]; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const offer = await prisma.offerLetter.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  const updated = await prisma.offerLetter.update({
    where: { id },
    data: {
      status: body.status ?? offer.status,
      salary: body.salary !== undefined ? body.salary : offer.salary,
      startDate: body.startDate ? new Date(body.startDate) : offer.startDate,
      benefitsJson: body.benefits !== undefined ? body.benefits : (offer.benefitsJson as string[]),
      notes: body.notes !== undefined ? body.notes : offer.notes,
      sentAt: body.status === "SENT" && offer.status !== "SENT" ? new Date() : offer.sentAt,
      respondedAt:
        body.status && ["ACCEPTED", "REJECTED"].includes(body.status) && !["ACCEPTED", "REJECTED"].includes(offer.status)
          ? new Date()
          : offer.respondedAt,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entityType: "OfferLetter",
      entityId: id,
      action: "OFFER_UPDATED",
      metadataJson: { previousStatus: offer.status, newStatus: body.status ?? offer.status },
    },
  });

  return NextResponse.json(updated);
}

// GET /api/offers/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const { id } = await params;
  const offer = await prisma.offerLetter.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          candidate: { select: { id: true, fullName: true, primaryEmail: true } },
          job: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(offer);
}
