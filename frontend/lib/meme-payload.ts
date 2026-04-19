import { z } from 'zod';

const MAX_BODY_BYTES = 24_576;

/** Remove NULs and most control characters; normalize whitespace. */
export function sanitizeText(input: string): string {
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

function requiredField(max: number) {
  return z
    .string()
    .max(max)
    .transform(sanitizeText)
    .pipe(z.string().min(1).max(max));
}

function optionalField(max: number) {
  return z
    .string()
    .max(max)
    .optional()
    .default('')
    .transform(sanitizeText);
}

export const memeGenerationSchema = z
  .object({
    brand_name: requiredField(200),
    product_or_service: requiredField(500),
    target_audience: requiredField(500),
    campaign_goal: requiredField(100),
    tone: requiredField(80),
    topics_to_avoid: optionalField(1000),
  })
  .strict();

export type MemeGenerationPayload = z.infer<typeof memeGenerationSchema>;

export function parseMemeJsonBody(raw: string): { ok: true; data: MemeGenerationPayload } | { ok: false; error: string } {
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return { ok: false, error: 'Payload too large' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Malformed body' };
  }

  const root = parsed as Record<string, unknown>;

  const inner =
    root.body !== undefined && typeof root.body === 'object' && root.body !== null && !Array.isArray(root.body)
      ? (root.body as Record<string, unknown>)
      : root;

  const asStr = (v: unknown): string | undefined => {
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return undefined;
  };

  const candidate = {
    brand_name: asStr(inner.brand_name),
    product_or_service: asStr(inner.product_or_service),
    target_audience: asStr(inner.target_audience),
    campaign_goal: asStr(inner.campaign_goal) ?? 'awareness',
    tone: asStr(inner.tone) ?? 'witty',
    topics_to_avoid: asStr(inner.topics_to_avoid) ?? '',
  };

  const result = memeGenerationSchema.safeParse(candidate);
  if (!result.success) {
    return { ok: false, error: 'Validation failed' };
  }

  return { ok: true, data: result.data };
}

export { MAX_BODY_BYTES };
