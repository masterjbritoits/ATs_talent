/**
 * Application Insights telemetry initialisation.
 *
 * Call initTelemetry() once at application startup (for example from
 * instrumentation.ts). The SDK is loaded lazily only when a connection string
 * is present so local dev stays clean and fast.
 */
let _initialised = false;
let _client: {
  trackEvent: (input: { name: string; properties?: Record<string, string> }) => void;
  trackException: (input: { exception: Error; properties?: Record<string, string> }) => void;
  trackMetric: (input: { name: string; value: number; properties?: Record<string, string> }) => void;
  flush: (input: { callback: () => void }) => void;
} | null = null;

async function loadAppInsights() {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  return require("applicationinsights");
}

export async function initTelemetry() {
  const connStr = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connStr || _initialised) return;

  const appInsights = await loadAppInsights();

  appInsights
    .setup(connStr)
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
}

/** Track a named event with optional properties. */
export function trackEvent(name: string, properties?: Record<string, string>) {
  if (!_initialised || !_client) return;
  _client.trackEvent({ name, properties });
}

/** Track an exception. */
export function trackException(error: Error, properties?: Record<string, string>) {
  if (!_initialised || !_client) return;
  _client.trackException({ exception: error, properties });
}

/** Track a metric value (for example sync duration). */
export function trackMetric(name: string, value: number, properties?: Record<string, string>) {
  if (!_initialised || !_client) return;
  _client.trackMetric({ name, value, properties });
}

/** Flush all buffered telemetry (useful before process shutdown). */
export function flushTelemetry(): Promise<void> {
  return new Promise((resolve) => {
    if (!_initialised || !_client) {
      resolve();
      return;
    }
    _client.flush({ callback: () => resolve() });
  });
}
