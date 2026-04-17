import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/health
 *
 * Liveness + readiness probe.
 * Returns 200 when the application and its critical dependencies are healthy.
 * Returns 503 when a dependency is down — Azure App Service / load balancers
 * should remove the instance from rotation.
 *
 * Response shape:
 * {
 *   "status": "ok" | "degraded",
 *   "checks": { "db": "ok" | "fail", "storage": "ok" | "skip" },
 *   "version": "...",
 *   "timestamp": "ISO-8601"
 * }
 */
export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // --- Database ---
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "ok";
  } catch (err) {
    checks.db = "fail";
    healthy = false;
    console.error("[health] DB check failed:", err);
  }

  // --- Blob Storage (optional) ---
  const storageConfigured = !!(
    process.env.AZURE_STORAGE_ACCOUNT_NAME ||
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  checks.storage = storageConfigured ? "configured" : "local-fs";

  // --- Service Bus (optional) ---
  const sbConfigured = !!(
    process.env.SERVICE_BUS_CONNECTION_STRING ||
    process.env.AZURE_SERVICE_BUS_NAMESPACE
  );
  checks.servicebus = sbConfigured ? "configured" : "sync-mode";

  // --- App Insights (optional) ---
  checks.telemetry = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? "configured" : "disabled";

  const status = healthy ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      checks,
      version: process.env.APP_VERSION ?? "local",
      timestamp: new Date().toISOString()
    },
    { status: healthy ? 200 : 503 }
  );
}
