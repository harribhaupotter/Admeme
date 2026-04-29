'use client';

import { Download, BarChart2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { AnalyticsModal } from '@/components/analytics-modal';

interface MemeCardProps {
  id: string;
  image: string;
  viralityScore: number;
  steppsScore?: number;
  cognitiveScore?: number;
  tippingScore?: number;
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
}

export function MemeCard({ id, image, viralityScore, steppsScore, cognitiveScore, tippingScore, reasoning, parameters }: MemeCardProps) {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasImage = Boolean(image && image.trim().length > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getScoreColor = (score: number) => {
    if (score > 3.5)
      return 'bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30';
    if (score > 2.5)
      return 'bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/25';
    return 'bg-rose-500/15 text-rose-900 ring-1 ring-rose-500/25 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/25';
  };

  const handleDownload = () => {
    if (!hasImage) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `meme-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasImage ? (
          <img 
            src={image} 
            alt={`Meme ${id}`} 
            className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105" 
            onClick={() => setIsZoomed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Meme image unavailable
          </div>
        )}

        {/* Bottom Right Download Button */}
        <div className="absolute bottom-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!hasImage}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/95 p-0 text-primary shadow-lg backdrop-blur-sm transition-colors hover:bg-white hover:text-primary"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Virality Score and View Analytics Button */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Virality Score</span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(
              viralityScore
            )}`}
          >
            {viralityScore.toFixed(1)}/5
          </span>
        </div>

        <Button
          onClick={() => setIsAnalyticsOpen(true)}
          variant="outline"
          size="sm"
          className="flex w-full items-center justify-center gap-2 border-primary/25 bg-primary/5 text-foreground hover:border-primary/45 hover:bg-primary/10"
        >
          <BarChart2 className="h-4 w-4" />
          View Analytics
        </Button>
      </div>

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        viralityScore={viralityScore}
        steppsScore={steppsScore}
        cognitiveScore={cognitiveScore}
        tippingScore={tippingScore}
        reasoning={reasoning}
        parameters={parameters}
      />

      {mounted && isZoomed && hasImage && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setIsZoomed(false)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 sm:-right-12 sm:top-0 rounded-full bg-background/20 hover:bg-background/40 text-foreground"
              onClick={() => setIsZoomed(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img src={image} alt={`Meme ${id} zoomed`} className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
