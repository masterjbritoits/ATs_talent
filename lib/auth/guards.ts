import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getSessionUserId } from "@/lib/auth/session";

export async function requireUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    redirect("/login");
  }

  return user;
}

/** Page-level guard — redirects to /dashboard on forbidden. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

/** API-level guard — returns 401/403 JSON instead of redirecting. */
export async function requireUserOrUnauthorized() {
  const userId = await getSessionUserId();
  if (!userId) return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  return { user, response: null };
}

export async function requireAdminOrForbidden() {
  const { user, response } = await requireUserOrUnauthorized();
  if (response) return { user: null, response };
  if (user!.role !== "ADMIN") return { user: null, response: NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 }) };
  return { user: user!, response: null };
}
