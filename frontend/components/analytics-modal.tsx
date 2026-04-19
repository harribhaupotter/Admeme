'use client';

import { BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

interface Metric {
  label: string;
  value: number;
  category: string;
}

export function AnalyticsModal({
  isOpen,
  onClose,
  viralityScore,
  reasoning,
  parameters = {},
}: AnalyticsModalProps) {
  const [expandedReasoning, setExpandedReasoning] = useState(false);

  // 13 AI parameters grouped by category - use passed parameters or fallbacks
  const metrics: Metric[] = [
    // STEPPS Metrics
    { label: 'Social Currency', value: parameters.socialCurrency ?? 8.5, category: 'STEPPS' },
    { label: 'Triggers', value: parameters.triggers ?? 7.8, category: 'STEPPS' },
    { label: 'Emotion', value: parameters.emotion ?? 8.2, category: 'STEPPS' },
    { label: 'Public', value: parameters.public ?? 7.5, category: 'STEPPS' },
    { label: 'Practical Value', value: parameters.practicalValue ?? 6.9, category: 'STEPPS' },
    { label: 'Story', value: parameters.story ?? 8.1, category: 'STEPPS' },
    // Cognitive Metrics
    { label: 'Visual Familiarity', value: parameters.visualFamiliarity ?? 7.3, category: 'Cognitive' },
    { label: 'Text Density', value: parameters.textDensity ?? 6.5, category: 'Cognitive' },
    { label: 'Sentiment Polarity', value: parameters.sentimentPolarity ?? 8.0, category: 'Cognitive' },
    { label: 'Subject Prominence', value: parameters.subjectProminence ?? 7.7, category: 'Cognitive' },
    // Tipping Point Metrics
    { label: 'Visual Hook', value: parameters.visualHook ?? 8.4, category: 'Tipping Point' },
    { label: 'Share Friction', value: parameters.shareFriction ?? 7.2, category: 'Tipping Point' },
    { label: 'Relatability Breadth', value: parameters.relatabilityBreadth ?? 7.9, category: 'Tipping Point' },
  ];

  const steppsMetrics = metrics.filter((m) => m.category === 'STEPPS');
  const cognitiveMetrics = metrics.filter((m) => m.category === 'Cognitive');
  const tippingPointMetrics = metrics.filter((m) => m.category === 'Tipping Point');

  const barGradient = (category: string) => {
    if (category === 'STEPPS') return 'from-chart-1 via-fuchsia-500 to-chart-4';
    if (category === 'Cognitive') return 'from-chart-2 via-teal-400 to-cyan-500';
    return 'from-chart-3 via-amber-400 to-orange-500';
  };

  const MetricProgressBar = ({ metric }: { metric: Metric }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{metric.label}</label>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {metric.value.toFixed(1)}/10
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient(metric.category)} transition-all duration-500 shadow-sm`}
          style={{ width: `${(metric.value / 10) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border/80 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">
        <DialogHeader className="space-y-0 border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <BarChart2 className="h-5 w-5" aria-hidden />
            </span>
            Meme analytics
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Detailed analytics showing virality score, STEPPS metrics, cognitive metrics, tipping point metrics, and AI reasoning for the generated meme.
        </DialogDescription>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid h-11 w-full grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1">
            <TabsTrigger
              value="metrics"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Metrics
            </TabsTrigger>
            <TabsTrigger
              value="reasoning"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              AI reasoning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-8 mt-6">
            {/* Overall Virality Score */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Overall Virality Score</h3>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="bg-gradient-to-br from-foreground to-foreground/65 bg-clip-text text-4xl font-bold text-transparent dark:from-primary dark:to-chart-4">
                    {viralityScore.toFixed(1)}
                  </span>
                  <span className="text-lg text-muted-foreground">/10</span>
                </div>
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-chart-4/15 to-chart-2/20 ring-2 ring-primary/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round((viralityScore / 10) * 100)}%
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Viral potential</div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEPPS Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                STEPPS Metrics
              </h3>
              <div className="space-y-4 rounded-xl border border-chart-1/20 bg-chart-1/5 p-4 dark:bg-chart-1/10">
                {steppsMetrics.map((metric) => (
                  <MetricProgressBar key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            {/* Cognitive Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Cognitive Metrics
              </h3>
              <div className="space-y-4 rounded-xl border border-chart-2/25 bg-chart-2/5 p-4 dark:bg-chart-2/10">
                {cognitiveMetrics.map((metric) => (
                  <MetricProgressBar key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            {/* Tipping Point Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Tipping Point Metrics
              </h3>
              <div className="space-y-4 rounded-xl border border-chart-3/25 bg-chart-3/5 p-4 dark:bg-chart-3/10">
                {tippingPointMetrics.map((metric) => (
                  <MetricProgressBar key={metric.label} metric={metric} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reasoning" className="mt-6 space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">AI Reasoning</h3>
              <div
                className={`rounded-xl border border-border bg-muted/40 p-4 transition-all duration-300 ${
                  expandedReasoning ? 'max-h-96 overflow-y-auto' : 'max-h-24'
                }`}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{reasoning}</p>
              </div>
              {!expandedReasoning && (
                <button
                  type="button"
                  onClick={() => setExpandedReasoning(true)}
                  className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Read more
                </button>
              )}
              {expandedReasoning && (
                <button
                  type="button"
                  onClick={() => setExpandedReasoning(false)}
                  className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Show less
                </button>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/10 p-4 dark:bg-primary/15">
              <h4 className="text-sm font-semibold text-foreground">Why these scores matter</h4>
              <p className="text-sm text-muted-foreground">
                These metrics are based on proven frameworks for viral content creation. Higher scores
                indicate stronger alignment with behavioral psychology principles that drive sharing.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
