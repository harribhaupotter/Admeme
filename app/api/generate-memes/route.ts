import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runMemePipeline } from "@/lib/meme-pipeline"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productName = formData.get("productName") as string
    const productDescription = formData.get("productDescription") as string
    const userId = formData.get("userId") as string
    const productImage = formData.get("productImage") as File | null

    if (!productName || !productDescription) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    console.log("[v0] Received meme generation request:", { productName, productDescription, userId })

    // Handle image upload (for now, we'll use a placeholder)
    let productImageUrl: string | undefined
    if (productImage) {
      // In a real implementation, you would upload to a storage service
      // For now, we'll use a placeholder
      productImageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(productName + " product image")}`
    }

    // Run the meme generation pipeline
    const { generationId, memes, trendingTopics } = await runMemePipeline(
      productName,
      productDescription,
      productImageUrl,
    )

    // Save to database
    const supabase = await createClient()

    // Insert generation record
    const { data: generation, error: generationError } = await supabase
      .from("meme_generations")
      .insert({
        product_name: productName,
        product_description: productDescription,
        product_image_url: productImageUrl,
        user_id: userId,
      })
      .select()
      .single()

    if (generationError) {
      console.error("[v0] Database error:", generationError)
      return NextResponse.json({ error: "Failed to save generation" }, { status: 500 })
    }

    // Insert meme records
    const memeInserts = memes.map((meme) => ({
      generation_id: generation.id,
      caption: meme.caption,
      image_url: meme.imageUrl,
      virality_score: meme.viralityScore,
      is_safe: meme.isSafe,
      safety_flags: meme.safetyFlags,
      user_id: userId,
    }))

    const { error: memesError } = await supabase.from("memes").insert(memeInserts)

    if (memesError) {
      console.error("[v0] Database error:", memesError)
      return NextResponse.json({ error: "Failed to save memes" }, { status: 500 })
    }

    console.log("[v0] Successfully saved generation to database")

    return NextResponse.json({
      generationId: generation.id,
      memes,
      trendingTopics,
      message: "Memes generated successfully!",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
