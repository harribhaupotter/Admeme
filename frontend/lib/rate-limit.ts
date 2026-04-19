import { NextResponse } from 'next/server';

/** In-memory fixed windows; use Redis/Upstash in production if you run many serverless instances. */
const buckets = new Map<string, { count: number; windowStart: number }>();

const AUTH_MAX = 5;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const MEME_MAX = 5;
const MEME_WINDOW_MS = 15 * 60 * 1000;
const GENERAL_MAX = 100;
const GENERAL_WINDOW_MS = 15 * 60 * 1000;

export type RateTier = 'auth' | 'meme' | 'general';

function tierConfig(tier: RateTier): { max: number; windowMs: number } {
  switch (tier) {
    case 'auth':
      return { max: AUTH_MAX, windowMs: AUTH_WINDOW_MS };
    case 'meme':
      return { max: MEME_MAX, windowMs: MEME_WINDOW_MS };
    case 'general':
      return { max: GENERAL_MAX, windowMs: GENERAL_WINDOW_MS };
    default:
      return { max: GENERAL_MAX, windowMs: GENERAL_WINDOW_MS };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function pruneIfNeeded(): void {
  if (buckets.size < 5000) return;
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [k, v] of buckets) {
    if (v.windowStart < cutoff) buckets.delete(k);
  }
}

export function checkRateLimit(
  tier: RateTier,
  ip: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  pruneIfNeeded();
  const { max, windowMs } = tierConfig(tier);
  const key = `${tier}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (bucket.count < max) {
    bucket.count += 1;
    return { ok: true };
  }

  const elapsed = now - bucket.windowStart;
  const retryAfterSec = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
  return { ok: false, retryAfterSec };
}

export function rateLimitExceededResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests', code: 'RATE_LIMIT' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'Cache-Control': 'no-store',
      },
    }
  );
}

export function rateLimitGuard(request: Request, tier: RateTier): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(tier, ip);
  if (result.ok) return null;
  return rateLimitExceededResponse(result.retryAfterSec);
}
