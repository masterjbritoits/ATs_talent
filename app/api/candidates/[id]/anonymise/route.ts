import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireAdminOrForbidden } from "@/lib/auth/guards";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAdminOrForbidden();
  if (response) return response;

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (candidate.anonymisedAt) {
    return NextResponse.json({ error: "Candidate already anonymised" }, { status: 409 });
  }

  await prisma.candidate.update({
    where: { id },
    data: {
      fullName:     "[REMOVED]",
      primaryEmail: `anon-${id}@removed.local`,
      phone:        null,
      linkedinUrl:  null,
      githubUrl:    null,
      location:     null,
      country:      null,
      currentTitle: null,
      summary:      null,
      anonymisedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId:  user.id,
      entityType:   "Candidate",
      entityId:     id,
      action:       "GDPR_ANONYMISE",
      metadataJson: {},
    },
  });

  return NextResponse.json({ ok: true });
}
