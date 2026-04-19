'use client';

import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { MemeForm } from '@/components/meme-form';
import type { MemeGenerationPayload } from '@/lib/meme-payload';
import { MemeCard } from '@/components/meme-card';
import { OfflineError } from '@/components/offline-error';

export type MemeResult = {
  id: string;
  image: string;
  viralityScore: number;
  reasoning: string;
  parameters?: {
    socialCurrency?: number;
    triggers?: number;
    emotion?: number;
    public?: number;
    practicalValue?: number;
    story?: number;
    visualFamiliarity?: number;
    textDensity?: number;
    sentimentPolarity?: number;
    subjectProminence?: number;
    visualHook?: number;
    shareFriction?: number;
    relatabilityBreadth?: number;
  };
};

function normalizeMemesFromApi(data: unknown): MemeResult[] {
  const raw = Array.isArray(data) ? data : (data as { memes?: unknown })?.memes;
  if (!Array.isArray(raw)) return [];
  return raw.map((m: Record<string, unknown>, index: number) => ({
    id: String(m.id ?? index + 1),
    image: String(m.image ?? m.meme_url ?? m.url ?? ''),
    viralityScore: Number(m.viralityScore ?? m.virality_score ?? 0),
    reasoning: String(m.reasoning ?? m.reasoning_text ?? ''),
    parameters:
      m.parameters && typeof m.parameters === 'object' && !Array.isArray(m.parameters)
        ? (m.parameters as MemeResult['parameters'])
        : undefined,
  }));
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [memes, setMemes] = useState<MemeResult[] | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleGenerateMemes = async (e: React.FormEvent, payload: MemeGenerationPayload) => {
    e.preventDefault();

    setIsLoading(true);
    setIsOffline(false);
    setIsRateLimited(false);

    try {
      const response = await fetch('/api/meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setMemes(null);
        setIsRateLimited(true);
        return;
      }

      if (!response.ok) {
        setMemes(null);
        setIsOffline(true);
        return;
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        setMemes(null);
        setIsOffline(true);
        return;
      }

      setMemes(normalizeMemesFromApi(data));
    } catch {
      setMemes(null);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,oklch(0.88_0.12_292/0.45),transparent_55%)]" />
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-chart-4/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-chart-2/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div id="demo" className="mb-16 scroll-mt-8">
          <MemeForm onGenerateMemes={handleGenerateMemes} isLoading={isLoading} />
        </div>

        {isRateLimited && !isLoading && (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-destructive"
            role="alert"
          >
            <p className="font-medium">Too many requests</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You can try again after a short wait (up to 15 minutes).
            </p>
          </div>
        )}

        {isOffline && !isRateLimited && !isLoading && <OfflineError />}

        {memes && !isLoading && !isOffline && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-lg shadow-primary/5 backdrop-blur-md">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Generated memes
              </h2>
              <p className="mt-2 text-muted-foreground">
                Ranked by virality potential — open analytics on any card for the full breakdown.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {memes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  id={meme.id}
                  image={meme.image}
                  viralityScore={meme.viralityScore}
                  reasoning={meme.reasoning}
                  parameters={meme.parameters}
                />
              ))}
            </div>
          </div>
        )}

        {!memes && !isLoading && !isOffline && !isRateLimited && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-gradient-to-b from-card/80 to-muted/40 py-20 text-center backdrop-blur-sm">
            <div className="mx-auto max-w-md space-y-4 px-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LayoutGrid className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Ready when you are
              </h3>
              <p className="text-muted-foreground">
                Complete the form and hit <span className="font-medium text-foreground">Generate Memes</span> to
                see ranked concepts, scores, and analytics.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
