import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { createSession, verifyPassword } from "@/lib/auth/session";
import { rateLimit } from "@/lib/utils/rate-limit";

// 5 attempts per 15 minutes per IP+email combination
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const body = await request.json().catch(() => null);
  if (!body?.email || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Rate limit by IP + email (normalised to lowercase)
  const rateLimitKey = `login:${ip}:${body.email.toLowerCase()}`;
  const { allowed, remaining, resetAt } = rateLimit(rateLimitKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);

  if (!allowed) {
    const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSecs),
          "X-RateLimit-Limit": String(LOGIN_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000))
        }
      }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      {
        status: 401,
        headers: {
          "X-RateLimit-Remaining": String(remaining)
        }
      }
    );
  }

  if (!user.isActive) {
    return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
