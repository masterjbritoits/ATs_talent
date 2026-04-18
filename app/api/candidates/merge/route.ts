import { NextRequest, NextResponse } from "next/server";

import { requireUserOrUnauthorized } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { mergeDuplicateCandidates } from "@/server/services/duplicate-detection/service";

export async function POST(request: NextRequest) {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body?.primaryCandidateId || !body?.duplicateCandidateId) {
    return NextResponse.json({ error: "primaryCandidateId and duplicateCandidateId required" }, { status: 400 });
  }

  if (body.primaryCandidateId === body.duplicateCandidateId) {
    return NextResponse.json({ error: "Cannot merge a candidate with itself" }, { status: 400 });
  }

  // Verify both candidates exist before merging
  const [primary, duplicate] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: body.primaryCandidateId }, select: { id: true, fullName: true } }),
    prisma.candidate.findUnique({ where: { id: body.duplicateCandidateId }, select: { id: true, fullName: true } })
  ]);

  if (!primary) return NextResponse.json({ error: "Primary candidate not found" }, { status: 404 });
  if (!duplicate) return NextResponse.json({ error: "Duplicate candidate not found" }, { status: 404 });

  const merged = await mergeDuplicateCandidates(body.primaryCandidateId, body.duplicateCandidateId);

  // Audit log with actor
  await prisma.auditLog.create({
    data: {
      actorUserId: user!.id,
      entityType: "Candidate",
      entityId: body.primaryCandidateId,
      action: "DUPLICATE_MERGED",
      metadataJson: {
        primaryName: primary.fullName,
        mergedName: duplicate.fullName,
        duplicateCandidateId: body.duplicateCandidateId
      }
    }
  });

  return NextResponse.json(merged);
}
