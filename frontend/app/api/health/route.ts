import { NextResponse } from 'next/server';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const limited = rateLimitGuard(request, 'general');
  if (limited) return limited;
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
