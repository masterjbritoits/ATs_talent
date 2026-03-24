import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { candidateUpdateSchema } from "@/lib/validators/candidate";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = candidateUpdateSchema.parse(await request.json());
  const updated = await prisma.candidate.update({
    where: { id },
    data: body
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Candidate",
      entityId: id,
      action: "candidate_updated",
      metadataJson: body
    }
  });

  return NextResponse.json(updated);
}
