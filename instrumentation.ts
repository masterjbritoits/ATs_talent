/**
 * Next.js instrumentation entry point.
 * This file is automatically loaded by Next.js 14+ when present.
 * It runs once per worker process — the correct place for singleton init.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initTelemetry } = await import("@/lib/telemetry/app-insights");
    initTelemetry();
  }
}
