/**
 * Simple in-memory rate limiter.
 *
 * NOTE: This implementation uses a module-level Map, so it only works correctly
 * for a **single-instance** deployment. For multi-instance / horizontally-scaled
 * deployments (e.g. multiple Node processes, serverless functions, or containers)
 * you must replace this store with a shared Redis instance – e.g. using ioredis or
 * Upstash Redis – so that rate-limit counters are shared across all instances.
 */

type RateLimitEntry = { count: number; resetAt: number }
const store = new Map<string, RateLimitEntry>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Remove expired entries from the store to avoid unbounded memory growth.
 * Call this periodically (e.g. from a cron job or a startup hook).
 */
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, entry] of Array.from(store.entries())) {
    if (now > entry.resetAt) store.delete(key)
  }
}
