'use client';

import { useState } from 'react';
import { Grid3x3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import type { MemeGenerationPayload } from '@/lib/meme-payload';

export type { MemeGenerationPayload };

interface MemeFormProps {
  onGenerateMemes: (e: React.FormEvent, payload: MemeGenerationPayload) => void | Promise<void>;
  isLoading: boolean;
}

export function MemeForm({ onGenerateMemes, isLoading }: MemeFormProps) {
  const [brandName, setBrandName] = useState('');
  const [productOrService, setProductOrService] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [tone, setTone] = useState('');
  const [topicsToAvoid, setTopicsToAvoid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    const payload: MemeGenerationPayload = {
      brand_name: brandName,
      product_or_service: productOrService,
      target_audience: targetAudience,
      campaign_goal: campaignGoal,
      tone,
      topics_to_avoid: topicsToAvoid,
    };
    void onGenerateMemes(e, payload);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/90 p-8 shadow-xl shadow-primary/10 ring-1 ring-primary/10 backdrop-blur-md transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/15">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-primary/25 to-chart-4/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-chart-2/15 blur-2xl" />

      <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Grid3x3 className="h-5 w-5" aria-hidden />
            </span>
            <Badge className="border-0 bg-secondary/90 text-secondary-foreground hover:bg-secondary">
              Brand-safe AI
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            AI meme generator
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Tune audience, goal, and tone — we rank concepts and explain why they might spread.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldGroup>
            <FieldLabel htmlFor="brand">Brand Name</FieldLabel>
            <Input
              id="brand"
              placeholder="e.g., TechStartup Co."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isLoading}
              className="mt-2 transition-all focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="service">Product / Service</FieldLabel>
            <Input
              id="service"
              placeholder="e.g., AI Analytics Platform"
              value={productOrService}
              onChange={(e) => setProductOrService(e.target.value)}
              disabled={isLoading}
              className="mt-2 transition-all focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldGroup>
            <FieldLabel htmlFor="audience">Target Audience</FieldLabel>
            <Input
              id="audience"
              placeholder="e.g., Tech entrepreneurs, Millennials"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={isLoading}
              className="mt-2 transition-all focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="goal">Campaign Goal</FieldLabel>
            <Select value={campaignGoal} onValueChange={setCampaignGoal} disabled={isLoading}>
              <SelectTrigger
                id="goal"
                className="mt-2 w-full transition-all hover:border-primary/35 data-[state=open]:border-primary/50"
              >
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent className="border-border shadow-lg">
                <SelectItem value="awareness">Brand Awareness</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <FieldGroup>
            <FieldLabel htmlFor="tone">Tone</FieldLabel>
            <Select value={tone} onValueChange={setTone} disabled={isLoading}>
              <SelectTrigger
                id="tone"
                className="mt-2 w-full transition-all hover:border-primary/35 data-[state=open]:border-primary/50"
              >
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent className="border-border shadow-lg">
                <SelectItem value="witty">Witty</SelectItem>
                <SelectItem value="sarcastic">Sarcastic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="unhinged">Unhinged</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="avoid">Topics to Avoid (Optional)</FieldLabel>
            <Textarea
              id="avoid"
              placeholder="e.g., Politics, controversial topics..."
              value={topicsToAvoid}
              onChange={(e) => setTopicsToAvoid(e.target.value)}
              disabled={isLoading}
              className="mt-2 h-20 resize-none transition-all focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FieldGroup>
        </div>

        <Button
          type="submit"
          disabled={
            isLoading || !brandName || !productOrService || !targetAudience || !campaignGoal || !tone
          }
          className="mt-4 w-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            'Generate Memes'
          )}
        </Button>
      </form>
    </div>
  );
}
