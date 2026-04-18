/**
 * Application Insights telemetry — Node.js only.
 *
 * This module is only safe to use in server-side contexts (API routes,
 * server components, instrumentation.ts). The SDK is loaded lazily via
 * conditional require to avoid bundling for browser.
 */

let _initialised = false;
let _client: any = null;

export async function initTelemetry() {
  if (typeof window !== "undefined") {
    // Browser context — skip
    return;
  }

  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || _initialised) {
    return;
  }

  try {
    // Dynamic require only in Node.js context
    const appInsights = require("applicationinsights");

    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setAutoCollectHeartbeat(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(process.env.NODE_ENV === "production")
      .start();

    _client = appInsights.defaultClient ?? null;
    _initialised = true;
  } catch (err) {
    console.warn("[telemetry] Failed to initialise Application Insights:", err);
  }
}

/** Track a named event (server-only). */
export function trackEvent(name: string, properties?: Record<string, string>) {
  if (!_initialised || !_client) return;
  _client.trackEvent?.({ name, properties });
}

/** Track an exception (server-only). */
export function trackException(error: Error, properties?: Record<string, string>) {
  if (!_initialised || !_client) return;
  _client.trackException?.({ exception: error, properties });
}

/** Track a metric value (server-only). */
export function trackMetric(name: string, value: number, properties?: Record<string, string>) {
  if (!_initialised || !_client) return;
  _client.trackMetric?.({ name, value, properties });
}

/** Flush all buffered telemetry (server-only). */
export function flushTelemetry(): Promise<void> {
  return new Promise((resolve) => {
    if (!_initialised || !_client) {
      resolve();
      return;
    }
    _client.flush?.({ callback: () => resolve() });
  });
}
