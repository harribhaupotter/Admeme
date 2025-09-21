// Mock data and utility functions for the meme generation pipeline

export interface TrendingTopic {
  topic: string
  popularity: number
  category: string
}

export interface MemeTemplate {
  id: string
  name: string
  imageUrl: string
  topText: string
  bottomText: string
}

export interface GeneratedMeme {
  caption: string
  imageUrl: string
  viralityScore: number
  isSafe: boolean
  safetyFlags: string[]
}

// Mock trending topics data
export const mockTrendingTopics: TrendingTopic[] = [
  { topic: "AI taking over", popularity: 95, category: "technology" },
  { topic: "Work from home life", popularity: 88, category: "lifestyle" },
  { topic: "Gen Z humor", popularity: 92, category: "culture" },
  { topic: "Sustainable living", popularity: 76, category: "environment" },
  { topic: "Crypto confusion", popularity: 84, category: "finance" },
  { topic: "Social media addiction", popularity: 89, category: "social" },
  { topic: "Productivity hacks", popularity: 78, category: "lifestyle" },
  { topic: "Streaming wars", popularity: 82, category: "entertainment" },
]

// Mock meme templates
export const mockMemeTemplates: MemeTemplate[] = [
  {
    id: "drake",
    name: "Drake Pointing",
    imageUrl: "/drake-pointing-meme.png",
    topText: "",
    bottomText: "",
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    imageUrl: "/meme-template-2.png",
    topText: "",
    bottomText: "",
  },
  {
    id: "expanding",
    name: "Expanding Brain",
    imageUrl: "/expanding-brain-meme-template.png",
    topText: "",
    bottomText: "",
  },
]

// Agentic Scraper Module - simulates fetching trending topics
export async function scrapeTrendingTopics(): Promise<TrendingTopic[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return random subset of trending topics
  const shuffled = [...mockTrendingTopics].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 5)
}

// Prompt Generator Module - combines product info with trending topics
export function generateMemePrompts(
  productName: string,
  productDescription: string,
  trendingTopics: TrendingTopic[],
): string[] {
  const prompts = [
    `Create a funny meme about ${productName} using the trending topic: ${trendingTopics[0]?.topic}`,
    `Make a relatable meme connecting ${productName} to ${trendingTopics[1]?.topic}`,
    `Generate a humorous caption for ${productName} that references ${trendingTopics[2]?.topic}`,
    `Create a witty meme about how ${productName} solves problems related to ${trendingTopics[3]?.topic}`,
    `Make a funny comparison meme featuring ${productName} and ${trendingTopics[4]?.topic}`,
  ]

  return prompts.filter((prompt) => prompt.includes(productName))
}

// Meme Generation Module - simulates AI meme generation
export async function generateMemes(prompts: string[], productName: string): Promise<GeneratedMeme[]> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const memeVariations = [
    {
      caption: `When you realize ${productName} actually works as advertised`,
      imageUrl: "/surprised-pikachu-meme.png",
      viralityScore: Math.floor(Math.random() * 30) + 70,
      isSafe: true,
      safetyFlags: [],
    },
    {
      caption: `Me: I don't need ${productName}\nAlso me: *buys ${productName}*`,
      imageUrl: "/drake-pointing-meme.jpg",
      viralityScore: Math.floor(Math.random() * 25) + 65,
      isSafe: true,
      safetyFlags: [],
    },
    {
      caption: `POV: You're explaining why ${productName} is worth the investment`,
      imageUrl: "/charlie-conspiracy-meme.jpg",
      viralityScore: Math.floor(Math.random() * 35) + 60,
      isSafe: true,
      safetyFlags: [],
    },
    {
      caption: `${productName} users vs everyone else`,
      imageUrl: "/chad-vs-virgin-meme.jpg",
      viralityScore: Math.floor(Math.random() * 40) + 55,
      isSafe: true,
      safetyFlags: [],
    },
    {
      caption: `When ${productName} goes on sale`,
      imageUrl: "/running-crowd-meme.jpg",
      viralityScore: Math.floor(Math.random() * 20) + 75,
      isSafe: true,
      safetyFlags: [],
    },
  ]

  // Return random subset
  const shuffled = [...memeVariations].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}

// Virality Prediction Model - assigns virality scores
export function predictVirality(meme: GeneratedMeme): number {
  // Simple mock algorithm based on caption length, keywords, etc.
  let score = Math.floor(Math.random() * 40) + 50 // Base score 50-90

  // Boost score for certain keywords
  const viralKeywords = ["POV", "Me:", "When", "vs", "Actually"]
  const hasViralKeywords = viralKeywords.some((keyword) => meme.caption.toLowerCase().includes(keyword.toLowerCase()))

  if (hasViralKeywords) score += 10
  if (meme.caption.length > 50 && meme.caption.length < 100) score += 5

  return Math.min(score, 100)
}

// Meme Appropriateness Filter - checks content safety
export function checkMemeAppropriateness(meme: GeneratedMeme): {
  isSafe: boolean
  safetyFlags: string[]
} {
  const inappropriateKeywords = ["hate", "violence", "explicit", "offensive", "discriminatory"]

  const safetyFlags: string[] = []
  let isSafe = true

  // Simple keyword filtering
  inappropriateKeywords.forEach((keyword) => {
    if (meme.caption.toLowerCase().includes(keyword)) {
      safetyFlags.push(`Contains potentially ${keyword} content`)
      isSafe = false
    }
  })

  // Additional checks could include sentiment analysis, etc.

  return { isSafe, safetyFlags }
}

// Main pipeline orchestrator
export async function runMemePipeline(
  productName: string,
  productDescription: string,
  productImageUrl?: string,
): Promise<{
  generationId: string
  memes: GeneratedMeme[]
  trendingTopics: TrendingTopic[]
}> {
  console.log("[v0] Starting meme generation pipeline...")

  // Step 1: Scrape trending topics
  console.log("[v0] Scraping trending topics...")
  const trendingTopics = await scrapeTrendingTopics()

  // Step 2: Generate prompts
  console.log("[v0] Generating meme prompts...")
  const prompts = generateMemePrompts(productName, productDescription, trendingTopics)

  // Step 3: Generate memes
  console.log("[v0] Generating memes...")
  let memes = await generateMemes(prompts, productName)

  // Step 4: Predict virality and check appropriateness
  console.log("[v0] Processing memes...")
  memes = memes.map((meme) => {
    const viralityScore = predictVirality(meme)
    const { isSafe, safetyFlags } = checkMemeAppropriateness(meme)

    return {
      ...meme,
      viralityScore,
      isSafe,
      safetyFlags,
    }
  })

  // Generate a unique ID for this generation
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  console.log("[v0] Pipeline complete!")

  return {
    generationId,
    memes,
    trendingTopics,
  }
}
