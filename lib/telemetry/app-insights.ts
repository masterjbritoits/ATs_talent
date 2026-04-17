/**
 * Application Insights telemetry initialisation.
 *
 * Call `initTelemetry()` once at application startup (e.g. in
 * instrumentation.ts for Next.js) or from the top-level server layout.
 *
 * When APPLICATIONINSIGHTS_CONNECTION_STRING is not set the module is a no-op
 * so local development is unaffected.
 */
import appInsights from "applicationinsights";

let _initialised = false;

export function initTelemetry() {
  const connStr = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connStr || _initialised) return;

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

  _initialised = true;
}

/** Track a named event with optional properties. */
export function trackEvent(name: string, properties?: Record<string, string>) {
  if (!_initialised) return;
  appInsights.defaultClient?.trackEvent({ name, properties });
}

/** Track an exception. */
export function trackException(error: Error, properties?: Record<string, string>) {
  if (!_initialised) return;
  appInsights.defaultClient?.trackException({ exception: error, properties });
}

/** Track a metric value (e.g. sync duration). */
export function trackMetric(name: string, value: number, properties?: Record<string, string>) {
  if (!_initialised) return;
  appInsights.defaultClient?.trackMetric({ name, value, properties });
}

/** Flush all buffered telemetry (useful before function host shuts down). */
export function flushTelemetry(): Promise<void> {
  return new Promise((resolve) => {
    if (!_initialised) {
      resolve();
      return;
    }
    appInsights.defaultClient?.flush({ callback: () => resolve() });
  });
}
