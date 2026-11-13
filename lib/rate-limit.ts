type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

function pruneExpired(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

/**
 * Simple in-memory per-instance rate limiter.
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  pruneExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
