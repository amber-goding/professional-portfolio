/**
 * Fixed-window in-memory rate limiter.
 *
 * Limitation: state lives in this process only. It resets on restart or
 * redeploy and is not shared between replicas, which is acceptable for a
 * single Railway instance of a low-traffic contact form.
 */
export function createRateLimiter({ windowMs, max, maxKeys = 10_000 }) {
  const windows = new Map();

  function prune(now) {
    for (const [key, entry] of windows) {
      if (now >= entry.resetAt) windows.delete(key);
    }
  }

  return {
    /** Count one event for `key`. Returns { allowed, retryAfterSeconds }. */
    take(key, now) {
      let entry = windows.get(key);
      if (!entry || now >= entry.resetAt) {
        if (windows.size >= maxKeys) prune(now);
        entry = { count: 0, resetAt: now + windowMs };
        windows.set(key, entry);
      }
      if (entry.count >= max) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
      }
      entry.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
