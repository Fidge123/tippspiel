import type { Context, Next } from 'hono';
import { rateLimitEnabled } from '../config';

interface Bucket {
  count: number;
  resetAt: number;
}

const SWEEP_INTERVAL_MS = 60_000;

const buckets = new Map<string, Bucket>();
let nextSweepAt = 0;

// X-Forwarded-For starts with whatever the client sent; nginx sets X-Real-IP itself.
function clientKey(c: Context, name: string): string {
  return `${name}:${c.req.header('x-real-ip') ?? 'unknown'}`;
}

function sweep(now: number): void {
  if (now < nextSweepAt) {
    return;
  }
  nextSweepAt = now + SWEEP_INTERVAL_MS;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function rateLimit(name: string, limit: number, windowMs = 60_000) {
  return async (c: Context, next: Next) => {
    if (!rateLimitEnabled) {
      return next();
    }

    const key = clientKey(c, name);
    const now = Date.now();
    sweep(now);
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
