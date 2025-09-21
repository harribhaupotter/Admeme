-- Create meme_generations table to store meme generation history
CREATE TABLE IF NOT EXISTS public.meme_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  product_image_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memes table to store individual generated memes
CREATE TABLE IF NOT EXISTS public.memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES public.meme_generations(id) ON DELETE CASCADE,
  caption TEXT NOT NULL,
  image_url TEXT,
  virality_score INTEGER CHECK (virality_score >= 0 AND virality_score <= 100),
  is_safe BOOLEAN DEFAULT true,
  safety_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meme_generations_created_at ON public.meme_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_generation_id ON public.memes(generation_id);
CREATE INDEX IF NOT EXISTS idx_memes_virality_score ON public.memes(virality_score DESC);

-- Enable Row Level Security (RLS) - for now, allow public access since no auth is required
ALTER TABLE public.meme_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required for this prototype)
CREATE POLICY "Allow public read access to meme_generations" ON public.meme_generations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to meme_generations" ON public.meme_generations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to memes" ON public.memes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to memes" ON public.memes FOR INSERT WITH CHECK (true);
