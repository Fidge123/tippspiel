import type { Context, Next } from 'hono';
import { rateLimitEnabled } from '../config';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function clientKey(c: Context, name: string): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  return `${name}:${forwarded ?? c.req.header('x-real-ip') ?? 'unknown'}`;
}

/** Replaces @nestjs/throttler, which kept the same counters in memory. */
export function rateLimit(name: string, limit: number, windowMs = 60_000) {
  return async (c: Context, next: Next) => {
    if (!rateLimitEnabled) {
      return next();
    }

    const key = clientKey(c, name);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return c.text('Zu viele Anfragen. Bitte warte einen Moment.', 429);
    }

    bucket.count += 1;
    return next();
  };
}

export function resetRateLimits(): void {
  buckets.clear();
}
