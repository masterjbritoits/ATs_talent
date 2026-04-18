/**
 * Next.js instrumentation entry point.
 * This file is automatically loaded by Next.js 14+ when present.
 * It runs once per worker process — the correct place for singleton init.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) return;

  const { initTelemetry } = await import("@/lib/telemetry/app-insights");
  await initTelemetry();
}
