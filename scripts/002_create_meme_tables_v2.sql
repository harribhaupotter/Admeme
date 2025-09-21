-- Creating updated version of database schema with better error handling
-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.memes CASCADE;
DROP TABLE IF EXISTS public.meme_generations CASCADE;

-- Create meme_generations table to store meme generation history
CREATE TABLE public.meme_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  product_image_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memes table to store individual generated memes
CREATE TABLE public.memes (
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
CREATE INDEX idx_meme_generations_created_at ON public.meme_generations(created_at DESC);
CREATE INDEX idx_memes_generation_id ON public.memes(generation_id);
CREATE INDEX idx_memes_virality_score ON public.memes(virality_score DESC);

-- Enable Row Level Security (RLS) - for now, allow public access since no auth is required
ALTER TABLE public.meme_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required for this prototype)
CREATE POLICY "Allow public read access to meme_generations" ON public.meme_generations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to meme_generations" ON public.meme_generations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to memes" ON public.memes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to memes" ON public.memes FOR INSERT WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO public.meme_generations (product_name, product_description, product_image_url) VALUES 
('Sample Product', 'A great product for testing', '/placeholder.svg?height=200&width=200');

INSERT INTO public.memes (generation_id, caption, image_url, virality_score, is_safe, safety_flags) VALUES 
((SELECT id FROM public.meme_generations LIMIT 1), 'When you finally find the perfect product', '/drake-pointing-meme.png', 85, true, '{}');
