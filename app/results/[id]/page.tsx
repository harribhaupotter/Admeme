"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Download, Share2, RefreshCw, TrendingUp, Shield, ShieldAlert, ArrowLeft, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Meme {
  id: string
  caption: string
  image_url: string
  virality_score: number
  is_safe: boolean
  safety_flags: string[]
  created_at: string
}

interface Generation {
  id: string
  product_name: string
  product_description: string
  product_image_url?: string
  created_at: string
  memes: Meme[]
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedMeme, setCopiedMeme] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        router.push("/auth/login")
        return
      }
      fetchResults()
    }
    getUser()
  }, [params.id, supabase.auth, router])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/generations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setGeneration(data.generation)
      } else {
        toast({
          title: "Error",
          description: "Failed to load results",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching results:", error)
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCaption = async (caption: string, memeId: string) => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopiedMeme(memeId)
      toast({
        title: "Copied!",
        description: "Meme caption copied to clipboard",
      })
      setTimeout(() => setCopiedMeme(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy caption",
        variant: "destructive",
      })
    }
  }

  const handleDownloadMeme = (meme: Meme) => {
    toast({
      title: "Download Started",
      description: "Meme download will begin shortly",
    })
  }

  const handleShareMeme = async (meme: Meme) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this meme!",
          text: meme.caption,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard",
      })
    }
  }

  const handleRegenerate = () => {
    router.push("/generate")
  }

  const getViralityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getViralityLabel = (score: number) => {
    if (score >= 80) return "High Viral Potential"
    if (score >= 60) return "Medium Viral Potential"
    return "Low Viral Potential"
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your memes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!generation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Generation Not Found</h1>
            <p className="text-muted-foreground mb-8">The requested meme generation could not be found.</p>
            <Link href="/generate">
              <Button>Generate New Memes</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/generate">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-balance">Meme Results</h1>
              <p className="text-muted-foreground">Generated for: {generation.product_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRegenerate} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Link href="/history">
              <Button variant="outline">View History</Button>
            </Link>
          </div>
        </div>

        {/* Product Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Product Name</h3>
                <p className="text-muted-foreground mb-4">{generation.product_name}</p>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{generation.product_description}</p>
              </div>
              {generation.product_image_url && (
                <div>
                  <h3 className="font-semibold mb-2">Product Image</h3>
                  <img
                    src={generation.product_image_url || "/placeholder.svg"}
                    alt={generation.product_name}
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Memes */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Generated Memes ({generation.memes?.length || 0})</h2>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {generation.memes?.map((meme, index) => (
              <Card key={meme.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Meme #{index + 1}</CardTitle>
                    <div className="flex items-center gap-1">
                      {meme.is_safe ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Safe
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Meme Image */}
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={meme.image_url || "/placeholder.svg"}
                      alt={`Meme ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Caption */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Caption</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyCaption(meme.caption, meme.id)}>
                        {copiedMeme === meme.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-lg">{meme.caption}</p>
                  </div>

                  {/* Virality Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Virality Score</span>
                      <span className={`text-sm font-bold ${getViralityColor(meme.virality_score)}`}>
                        {meme.virality_score}%
                      </span>
                    </div>
                    <Progress value={meme.virality_score} className="h-2" />
                    <p className={`text-xs ${getViralityColor(meme.virality_score)}`}>
                      {getViralityLabel(meme.virality_score)}
                    </p>
                  </div>

                  {/* Safety Flags */}
                  {meme.safety_flags && meme.safety_flags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-destructive">Safety Concerns</h4>
                      <div className="space-y-1">
                        {meme.safety_flags.map((flag, flagIndex) => (
                          <Badge key={flagIndex} variant="destructive" className="text-xs">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadMeme(meme)} className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShareMeme(meme)} className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!generation.memes || generation.memes.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No memes were generated for this request.</p>
                <Button onClick={handleRegenerate}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generation Info */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Generation ID:</span>
                <p className="text-muted-foreground font-mono">{generation.id}</p>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <p className="text-muted-foreground">{new Date(generation.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
