import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserOrUnauthorized } from "@/lib/auth/guards";

// GET /api/offers
export async function GET(_req: NextRequest) {
  const { response } = await requireUserOrUnauthorized();
  if (response) return response;

  const offers = await prisma.offerLetter.findMany({
    include: {
      application: {
        include: {
          candidate: { select: { id: true, fullName: true, primaryEmail: true } },
          job: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}

// POST /api/offers
export async function POST(req: NextRequest) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  let body: { applicationId: string; salary?: string; startDate?: string; benefits?: string[]; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.applicationId) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }

  const app = await prisma.application.findUnique({ where: { id: body.applicationId } });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const existing = await prisma.offerLetter.findUnique({ where: { applicationId: body.applicationId } });
  if (existing) return NextResponse.json({ error: "Offer already exists for this application" }, { status: 409 });

  const offer = await prisma.offerLetter.create({
    data: {
      applicationId: body.applicationId,
      salary: body.salary ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      benefitsJson: body.benefits ?? [],
      notes: body.notes ?? null,
      status: "DRAFT",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entityType: "OfferLetter",
      entityId: offer.id,
      action: "OFFER_CREATED",
      metadataJson: { applicationId: body.applicationId },
    },
  });

  return NextResponse.json(offer, { status: 201 });
}
