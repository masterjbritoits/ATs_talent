import { NextRequest, NextResponse } from "next/server";

import { requireAdminOrForbidden } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdminOrForbidden();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Prevent admin from deactivating their own account
  if (id === user!.id && body.isActive === false) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  const allowed: Record<string, unknown> = {};
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (body.role === "ADMIN" || body.role === "RECRUITER") allowed.role = body.role;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: allowed,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorUserId: user!.id,
      entityType: "User",
      entityId: id,
      action: "USER_UPDATED",
      metadataJson: allowed as Record<string, string | boolean>
    }
  });

  return NextResponse.json(updated);
}
