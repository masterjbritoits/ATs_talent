/**
 * In-process rate limiter using a sliding window counter.
 * Suitable for single-instance (local workstation) deployments.
 * In multi-instance production, replace with Redis-backed solution.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
      }
    },
    5 * 60 * 1000
  );
}

/**
 * @param key      — identifier (e.g. IP + email)
 * @param limit    — max requests per window
 * @param windowMs — window size in milliseconds
 * @returns { allowed, remaining, resetAt }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
}
