import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Fetch generation with associated memes
    const { data: generation, error: generationError } = await supabase
      .from("meme_generations")
      .select(`
        *,
        memes (*)
      `)
      .eq("id", id)
      .single()

    if (generationError || !generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    if (generation.user_id && generation.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({
      generation,
      memes: generation.memes || [],
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
