import { NextResponse } from 'next/server';
import { MAX_BODY_BYTES, parseMemeJsonBody } from '@/lib/meme-payload';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * Proxies meme generation to n8n using server-only env (no webhook URL in the browser).
 * Rate limit: 5 requests per IP per 15 minutes (same window as other abuse-sensitive routes).
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, 'meme');
  if (limited) return limited;

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const n = parseInt(contentLength, 10);
    if (!Number.isFinite(n) || n > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large', code: 'PAYLOAD_LIMIT' }, { status: 413 });
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body', code: 'BODY_READ' }, { status: 400 });
  }

  const parsed = parseMemeJsonBody(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, code: 'VALIDATION' }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Service unavailable', code: 'CONFIG' }, { status: 503 });
  }

  const secret = process.env.MEME_WEBHOOK_SECRET;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (secret) {
    headers['X-Webhook-Secret'] = secret;
  }

  const upstreamBody = JSON.stringify({ body: parsed.data });

  let upstream: Response;
  try {
    upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: upstreamBody,
      signal: AbortSignal.timeout(110_000),
    });
  } catch {
    return NextResponse.json({ error: 'Upstream unavailable', code: 'UPSTREAM' }, { status: 502 });
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Generation failed', code: 'UPSTREAM_STATUS' }, { status: 502 });
  }

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid upstream response', code: 'UPSTREAM_JSON' }, { status: 502 });
  }

  return NextResponse.json(data, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
