const WINDOW_MS = 60_000;
const LIMIT = 20;

const counters = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || existing.resetAt < now) {
    counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (existing.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  counters.set(key, existing);
  return { allowed: true, remaining: LIMIT - existing.count };
}
