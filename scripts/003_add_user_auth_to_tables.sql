-- Update existing tables to include user authentication
-- Add user_id column to meme_generations table
ALTER TABLE meme_generations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on meme_generations
ALTER TABLE meme_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meme_generations
DROP POLICY IF EXISTS "Users can view their own generations" ON meme_generations;
CREATE POLICY "Users can view their own generations" ON meme_generations 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own generations" ON meme_generations 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own generations" ON meme_generations 
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own generations" ON meme_generations 
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Add user_id column to memes table
ALTER TABLE memes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on memes
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for memes
DROP POLICY IF EXISTS "Users can view their own memes" ON memes;
CREATE POLICY "Users can view their own memes" ON memes 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own memes" ON memes;
CREATE POLICY "Users can insert their own memes" ON memes 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own memes" ON memes;
CREATE POLICY "Users can update their own memes" ON memes 
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own memes" ON memes;
CREATE POLICY "Users can delete their own memes" ON memes 
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Update existing records to allow public access (for demo purposes)
-- In production, you might want to assign these to a specific user or delete them
UPDATE meme_generations SET user_id = NULL WHERE user_id IS NULL;
UPDATE memes SET user_id = NULL WHERE user_id IS NULL;
