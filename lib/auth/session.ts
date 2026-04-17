import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { env } from "@/lib/utils/env";

const SESSION_COOKIE = "itsector_ats_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  const [userId, signature] = raw.split(".");
  if (signature !== getSignature(userId)) {
    return null;
  }

  return userId;
}

function signValue(userId: string) {
  return `${userId}.${getSignature(userId)}`;
}

function getSignature(userId: string) {
  const secret = env("SESSION_SECRET");
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not configured. " +
        "Set it in Azure App Service application settings or as a Key Vault reference."
    );
  }
  return Buffer.from(`${userId}:${secret}`).toString("base64url");
}
