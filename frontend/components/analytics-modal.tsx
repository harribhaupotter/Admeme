'use client';

import { BarChart2, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
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

interface Metric {
  label: string;
  value?: number;
  category: string;
}

export function AnalyticsModal({
  isOpen,
  onClose,
  viralityScore,
  steppsScore,
  cognitiveScore,
  tippingScore,
  reasoning,
  parameters = {},
}: AnalyticsModalProps) {
  const [expandedReasoning, setExpandedReasoning] = useState(false);

  // 13 AI parameters grouped by category - render backend values only.
  const metrics: Metric[] = [
    // STEPPS Metrics
    { label: 'Social Currency', value: parameters.socialCurrency, category: 'STEPPS' },
    { label: 'Triggers', value: parameters.triggers, category: 'STEPPS' },
    { label: 'Emotion', value: parameters.emotion, category: 'STEPPS' },
    { label: 'Public', value: parameters.public, category: 'STEPPS' },
    { label: 'Practical Value', value: parameters.practicalValue, category: 'STEPPS' },
    { label: 'Story', value: parameters.story, category: 'STEPPS' },
    // Cognitive Metrics
    { label: 'Visual Familiarity', value: parameters.visualFamiliarity, category: 'Cognitive' },
    { label: 'Text Density', value: parameters.textDensity, category: 'Cognitive' },
    { label: 'Sentiment Polarity', value: parameters.sentimentPolarity, category: 'Cognitive' },
    { label: 'Subject Prominence', value: parameters.subjectProminence, category: 'Cognitive' },
    // Tipping Point Metrics
    { label: 'Visual Hook', value: parameters.visualHook, category: 'Tipping Point' },
    { label: 'Share Friction', value: parameters.shareFriction, category: 'Tipping Point' },
    { label: 'Relatability Breadth', value: parameters.relatabilityBreadth, category: 'Tipping Point' },
  ];

  const steppsMetrics = metrics.filter((m) => m.category === 'STEPPS');
  const cognitiveMetrics = metrics.filter((m) => m.category === 'Cognitive');
  const tippingPointMetrics = metrics.filter((m) => m.category === 'Tipping Point');

  const barGradient = (category: string) => {
    if (category === 'STEPPS') return 'from-chart-1 via-fuchsia-500 to-chart-4';
    if (category === 'Cognitive') return 'from-chart-2 via-teal-400 to-cyan-500';
    return 'from-chart-3 via-amber-400 to-orange-500';
  };

  const formatMetricValue = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(1)}/5` : 'N/A';

  const metricWidth = (value?: number) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, (value / 5) * 100));
  };

  const MetricProgressBar = ({ metric }: { metric: Metric }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/90">{metric.label}</label>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {formatMetricValue(metric.value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient(metric.category)} transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${metricWidth(metric.value)}%` }}
        />
      </div>
    </div>
  );

  const radarData = metrics.map(m => ({
    subject: m.label.split(' ')[0], // Shorten labels for radar
    score: m.value || 0,
    fullMark: 5
  }));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-black/80 shadow-2xl backdrop-blur-3xl sm:rounded-[2rem] p-6 sm:p-8">
        <DialogHeader className="space-y-0 border-b border-white/10 pb-6 flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/20">
              <BarChart2 className="h-6 w-6" aria-hidden />
            </span>
            Analytics Engine
          </DialogTitle>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> Export Report
          </Button>
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

          <TabsContent value="metrics" className="space-y-8 mt-8">
            {/* Top Row: Score + Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Virality Potential</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
                    {viralityScore.toFixed(1)}
                  </span>
                  <span className="text-2xl text-muted-foreground font-light">/5</span>
                </div>
              </div>

              <div className="h-64 rounded-3xl bg-white/5 border border-white/10 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Radar name="Score" dataKey="score" stroke="#ffffff" fill="#ffffff" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* STEPPS Metrics */}
            <div className="space-y-3">
              <h3 className="flex items-center justify-between text-sm font-semibold text-foreground uppercase tracking-wide">
                <span>STEPPS Metrics</span>
                {steppsScore !== undefined && (
                  <span className="bg-chart-1/10 text-chart-1 rounded-full px-2 py-0.5 text-xs font-bold">
                    {steppsScore.toFixed(1)}/5
                  </span>
                )}
              </h3>
              <div className="space-y-4 rounded-xl border border-chart-1/20 bg-chart-1/5 p-4 dark:bg-chart-1/10">
                {steppsMetrics.map((metric) => (
                  <MetricProgressBar key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            {/* Cognitive Metrics */}
            <div className="space-y-3">
              <h3 className="flex items-center justify-between text-sm font-semibold text-foreground uppercase tracking-wide">
                <span>Cognitive Metrics</span>
                {cognitiveScore !== undefined && (
                  <span className="bg-chart-2/10 text-chart-2 rounded-full px-2 py-0.5 text-xs font-bold">
                    {cognitiveScore.toFixed(1)}/5
                  </span>
                )}
              </h3>
              <div className="space-y-4 rounded-xl border border-chart-2/25 bg-chart-2/5 p-4 dark:bg-chart-2/10">
                {cognitiveMetrics.map((metric) => (
                  <MetricProgressBar key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            {/* Tipping Point Metrics */}
            <div className="space-y-3">
              <h3 className="flex items-center justify-between text-sm font-semibold text-foreground uppercase tracking-wide">
                <span>Tipping Point Metrics</span>
                {tippingScore !== undefined && (
                  <span className="bg-chart-3/10 text-chart-3 rounded-full px-2 py-0.5 text-xs font-bold">
                    {tippingScore.toFixed(1)}/5
                  </span>
                )}
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
                  expandedReasoning ? 'max-h-96 overflow-y-auto' : 'max-h-24 overflow-hidden'
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
