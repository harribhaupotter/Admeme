import { NextResponse } from 'next/server';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Placeholder for future authentication. Rate limit: 5 requests per IP per 15 minutes.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, 'auth');
  if (limited) return limited;

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 4096) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  try {
    await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  return NextResponse.json(
    { error: 'Authentication is not configured for this deployment.' },
    { status: 501, headers: { 'Cache-Control': 'no-store' } }
  );
}
