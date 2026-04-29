import { NextResponse } from 'next/server';
import { MAX_BODY_BYTES, parseMemeJsonBody } from '@/lib/meme-payload';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 900;

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

  // n8n Webhook node exposes request JSON at: $json.body
  // So we must send the payload directly (not nested under "body"),
  // otherwise n8n would see $json.body.body.brand_name, etc.
  const upstreamBody = JSON.stringify(parsed.data);

  let upstream: Response;
  try {
    // [PRESENTATION MODE] Send a background ping to the Jarvis Ngrok server so the terminal logs light up
    fetch("https://eriophyllous-unrash-jeana.ngrok-free.dev/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: upstreamBody
    }).catch(() => {}); // Ignore errors silently so it doesn't break the actual app
    
    upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: upstreamBody,
      // n8n pipeline can have highly variable latency.
      signal: AbortSignal.timeout(890_000),
    });
  } catch {
    return NextResponse.json({ error: 'Upstream unavailable', code: 'UPSTREAM' }, { status: 502 });
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: 'Generation failed',
        code: 'UPSTREAM_STATUS',
        upstreamStatus: upstream.status,
        upstreamBody: text.slice(0, 2000),
      },
      { status: 502 }
    );
  }

  if (!text) {
    return NextResponse.json({ error: 'Empty upstream response', code: 'UPSTREAM_EMPTY' }, { status: 502 });
  }

  try {
    const data = JSON.parse(text) as unknown;
    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    // Some n8n configurations may return plain text.
    return NextResponse.json(
      {
        ok: true,
        raw: text,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
