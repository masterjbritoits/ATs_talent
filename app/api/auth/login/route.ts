import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { createSession, verifyPassword } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
