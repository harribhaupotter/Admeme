'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Clock, ArrowUpDown, Scale, X } from 'lucide-react';
import { MemeForm } from '@/components/meme-form';
import type { MemeGenerationPayload } from '@/lib/meme-payload';
import { MemeCard } from '@/components/meme-card';
import { OfflineError } from '@/components/offline-error';

export type MemeResult = {
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
};

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function normalizeParameters(input: unknown): MemeResult['parameters'] | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const p = input as Record<string, unknown>;

  const normalized: MemeResult['parameters'] = {
    socialCurrency: asNumber(p.socialCurrency ?? p.social_currency),
    triggers: asNumber(p.triggers),
    emotion: asNumber(p.emotion),
    public: asNumber(p.public ?? p.public_value),
    practicalValue: asNumber(p.practicalValue ?? p.practical_value),
    story: asNumber(p.story ?? p.storytelling),
    visualFamiliarity: asNumber(p.visualFamiliarity ?? p.visual_familiarity),
    textDensity: asNumber(p.textDensity ?? p.text_density),
    sentimentPolarity: asNumber(p.sentimentPolarity ?? p.sentiment_polarity),
    subjectProminence: asNumber(p.subjectProminence ?? p.subject_prominence),
    visualHook: asNumber(p.visualHook ?? p.visual_hook ?? p.visual_hooks),
    shareFriction: asNumber(p.shareFriction ?? p.share_friction),
    relatabilityBreadth: asNumber(p.relatabilityBreadth ?? p.relatability_breadth),
  };

  const hasAny = Object.values(normalized).some((v) => typeof v === 'number');
  return hasAny ? normalized : undefined;
}

function normalizeMemesFromApi(data: unknown): MemeResult[] {
  const obj = data as Record<string, unknown> | null;

  const pickArray = (value: unknown): unknown[] | null => (Array.isArray(value) ? value : null);

  const raw =
    pickArray(data) ??
    (obj && pickArray(obj.memes)) ??
    (obj && pickArray(obj.data)) ??
    (obj && typeof obj.data === 'object' && obj.data !== null && pickArray((obj.data as Record<string, unknown>).memes)) ??
    null;

  if (!raw) return [];
  return raw.map((item: unknown, index: number) => {
    const m = item as Record<string, unknown>;
    const inner =
      m && typeof m === 'object' && m !== null && 'json' in m && typeof m.json === 'object' && m.json !== null && !Array.isArray(m.json)
        ? (m.json as Record<string, unknown>)
        : m;

    const image = String(inner.image ?? inner.meme_url ?? inner.url ?? inner.memeUrl ?? '');
    return {
      id: String(inner.id ?? index + 1),
      image,
      viralityScore: Number(inner.viralityScore ?? inner.virality_score ?? inner.virality_score ?? 0),
      steppsScore: Number(inner.steppsScore ?? inner.stepps_score ?? 0),
      cognitiveScore: Number(inner.cognitiveScore ?? inner.cognitive_score ?? 0),
      tippingScore: Number(inner.tippingScore ?? inner.tipping_score ?? 0),
      reasoning: String(inner.reasoning ?? inner.reasoning_text ?? inner.error_message ?? ''),
      parameters: normalizeParameters(inner.parameters),
    };
  });
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [memes, setMemes] = useState<MemeResult[] | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // New Feature States
  const [historyMemes, setHistoryMemes] = useState<MemeResult[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [sortBy, setSortBy] = useState<'virality' | 'stepps' | 'cognitive'>('virality');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<MemeResult[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('admeme_history');
    if (saved) {
      try { setHistoryMemes(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  // Save to history when new memes are generated
  useEffect(() => {
    if (memes && memes.length > 0) {
      setHistoryMemes(prev => {
        const newHistory = [...memes, ...prev].filter((m, i, self) => i === self.findIndex(t => t.id === m.id));
        localStorage.setItem('admeme_history', JSON.stringify(newHistory.slice(0, 50))); // Keep last 50
        return newHistory;
      });
      setActiveTab('current');
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  }, [memes]);

  const handleGenerateMemes = async (e: React.FormEvent, payload: MemeGenerationPayload) => {
    e.preventDefault();
    setIsLoading(true);
    setIsOffline(false);
    setIsRateLimited(false);
    setErrorDetail(null);

    try {
      const response = await fetch('/api/meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setMemes(null);
        setIsRateLimited(true);
        return;
      }

      if (!response.ok) {
        try {
          const err = (await response.json()) as any;
          const detail = [ err.error || 'Request failed', err.code ? `(code: ${err.code})` : '' ].filter(Boolean).join(' ').trim();
          if (detail) setErrorDetail(detail);
        } catch {}
        setMemes(null);
        setIsOffline(true);
        return;
      }

      const data = await response.json();
      const normalized = normalizeMemesFromApi(data);
      if (normalized.length === 0) setErrorDetail('No meme results were returned by backend.');
      setMemes(normalized);
    } catch {
      setMemes(null);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedMemes = activeTab === 'current' ? memes : historyMemes;
  
  // Sorting logic
  const sortedMemes = displayedMemes ? [...displayedMemes].sort((a, b) => {
    if (sortBy === 'virality') return b.viralityScore - a.viralityScore;
    if (sortBy === 'stepps') return (b.steppsScore || 0) - (a.steppsScore || 0);
    if (sortBy === 'cognitive') return (b.cognitiveScore || 0) - (a.cognitiveScore || 0);
    return 0;
  }) : null;

  const toggleCompareSelection = (meme: MemeResult) => {
    setSelectedForCompare(prev => {
      if (prev.find(m => m.id === meme.id)) return prev.filter(m => m.id !== meme.id);
      if (prev.length >= 2) return [prev[1], meme];
      return [...prev, meme];
    });
  };

  return (
    <main className="min-h-screen bg-background relative font-sans text-foreground selection:bg-primary/30">
      {/* Sleek Minimal Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background opacity-50" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-24">
        {/* Massive Typography Header */}
        <div className="text-center mb-20 space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
            Admeme.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Generate viral-worthy memes tailored to your brand, audience, and tone.
          </p>
        </div>

        <div className="mb-20 max-w-4xl mx-auto">
          <MemeForm onGenerateMemes={handleGenerateMemes} isLoading={isLoading} />
        </div>

        {isRateLimited && !isLoading && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-6 py-8 text-center text-destructive mx-auto max-w-2xl">
            <p className="font-semibold text-lg">Rate Limit Exceeded</p>
            <p className="mt-2 text-sm opacity-80">Please wait a few minutes before trying again.</p>
          </div>
        )}

        {isOffline && !isRateLimited && !isLoading && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <OfflineError />
            {errorDetail && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-mono">
                {errorDetail}
              </div>
            )}
          </div>
        )}

        {(memes || historyMemes.length > 0) && !isLoading && !isOffline && (
          <div className="space-y-10">
            {/* Control Bar: Tabs, Sort, Compare */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-card/40 border border-border/50 rounded-2xl backdrop-blur-xl">
              <div className="flex space-x-1 p-1 bg-black/20 rounded-xl">
                <button 
                  onClick={() => setActiveTab('current')} 
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'current' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="inline-block w-4 h-4 mr-2" /> Current
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Clock className="inline-block w-4 h-4 mr-2" /> History
                </button>
              </div>

              {sortedMemes && sortedMemes.length > 0 && (
                <div className="flex items-center gap-3 pr-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-black/20 px-4 py-2.5 rounded-xl">
                    <ArrowUpDown className="w-4 h-4" />
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent border-none outline-none font-medium text-foreground cursor-pointer"
                    >
                      <option value="virality">Top Virality</option>
                      <option value="stepps">Highest STEPPS</option>
                      <option value="cognitive">Highest Cognitive</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setCompareMode(!compareMode);
                      setSelectedForCompare([]);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${compareMode ? 'bg-accent text-white shadow-lg' : 'bg-black/20 text-muted-foreground hover:text-foreground'}`}
                  >
                    {compareMode ? <X className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                    {compareMode ? 'Cancel Compare' : 'Compare'}
                  </button>
                </div>
              )}
            </div>

            {/* Compare Bar */}
            {compareMode && (
              <div className="sticky top-4 z-50 p-4 bg-card/80 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                  <Scale className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Select 2 memes to compare ({selectedForCompare.length}/2)</span>
                </div>
                {selectedForCompare.length === 2 && (
                  <button onClick={() => setShowCompareModal(true)} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-transform">
                    View Comparison
                  </button>
                )}
              </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && selectedForCompare.length === 2 && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setShowCompareModal(false)}>
                <div className="relative max-w-6xl w-full bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowCompareModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white">
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Head-to-Head Comparison</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[0, 1].map(i => {
                      const meme = selectedForCompare[i];
                      const otherMeme = selectedForCompare[i === 0 ? 1 : 0];
                      const isWinner = meme.viralityScore > otherMeme.viralityScore;
                      return (
                        <div key={meme.id} className={`p-6 rounded-3xl border ${isWinner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
                          {isWinner && <div className="text-emerald-400 font-bold mb-4 uppercase tracking-widest text-sm flex items-center gap-2">🏆 Winner</div>}
                          <img src={meme.image} alt="Meme" className="w-full h-64 object-contain rounded-xl mb-6 bg-black/50" />
                          
                          <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-5xl font-black">{meme.viralityScore.toFixed(1)}</span>
                            <span className="text-muted-foreground">/ 5 Virality</span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">STEPPS Score</span>
                                <span className="font-bold">{meme.steppsScore?.toFixed(1) || 'N/A'}</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-fuchsia-500" style={{width: `${(meme.steppsScore || 0) * 20}%`}} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Cognitive Score</span>
                                <span className="font-bold">{meme.cognitiveScore?.toFixed(1) || 'N/A'}</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-400" style={{width: `${(meme.cognitiveScore || 0) * 20}%`}} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Tipping Score</span>
                                <span className="font-bold">{meme.tippingScore?.toFixed(1) || 'N/A'}</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400" style={{width: `${(meme.tippingScore || 0) * 20}%`}} />
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 p-4 rounded-xl bg-black/40 text-sm text-muted-foreground leading-relaxed border border-white/5">
                            {meme.reasoning}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {sortedMemes?.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">No memes found.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedMemes?.map((meme) => (
                <div key={meme.id} className="relative group" onClick={() => compareMode && toggleCompareSelection(meme)}>
                  <div className={`transition-all duration-300 ${compareMode ? 'cursor-pointer' : ''} ${compareMode && !selectedForCompare.find(m => m.id === meme.id) ? 'opacity-50 scale-95' : 'opacity-100'}`}>
                    <MemeCard
                      id={meme.id}
                      image={meme.image}
                      viralityScore={meme.viralityScore}
                      reasoning={meme.reasoning}
                      parameters={meme.parameters}
                    />
                  </div>
                  {compareMode && selectedForCompare.find(m => m.id === meme.id) && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-xl border-2 border-background z-20">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
