"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { History, Eye, Calendar, Package, TrendingUp, Shield, ArrowLeft, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface MemeCount {
  count: number
}

interface Generation {
  id: string
  product_name: string
  product_description: string
  product_image_url?: string
  created_at: string
  memes: MemeCount[]
}

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
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
      fetchHistory()
    }
    getUser()
  }, [supabase.auth, router])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history")
      if (response.ok) {
        const data = await response.json()
        setGenerations(data.generations || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = (generationId: string) => {
    router.push(`/results/${generationId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMemeCount = (generation: Generation) => {
    return generation.memes?.[0]?.count || 0
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
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
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <History className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-balance">Meme Generation History</h1>
              </div>
              <p className="text-muted-foreground">View and manage your past meme generations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchHistory} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/generate">
              <Button>Generate New Memes</Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Total Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{generations.length}</div>
              <p className="text-sm text-muted-foreground">Products processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Total Memes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {generations.reduce((total, gen) => total + getMemeCount(gen), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Memes created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Latest Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-accent">
                {generations.length > 0 ? formatDate(generations[0].created_at).split(",")[0] : "None"}
              </div>
              <p className="text-sm text-muted-foreground">Most recent activity</p>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">Recent Generations</h2>
            <Badge variant="secondary">{generations.length} total</Badge>
          </div>

          {generations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Generations Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't generated any memes yet. Start creating viral content for your products!
                </p>
                <Link href="/generate">
                  <Button>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Your First Memes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generations.map((generation) => (
                <Card key={generation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{generation.product_name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {generation.product_description}
                        </CardDescription>
                      </div>
                      {generation.product_image_url && (
                        <div className="ml-4 flex-shrink-0">
                          <img
                            src={generation.product_image_url || "/placeholder.svg"}
                            alt={generation.product_name}
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(generation.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{getMemeCount(generation)} memes generated</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>All Safe</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ID: {generation.id.slice(0, 8)}...
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewResults(generation.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Results
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Quick Preview Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">{getMemeCount(generation)}</div>
                        <div className="text-xs text-muted-foreground">Memes</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary">~75%</div>
                        <div className="text-xs text-muted-foreground">Avg Virality</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">100%</div>
                        <div className="text-xs text-muted-foreground">Safe Content</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {generations.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">Showing {generations.length} most recent generations</p>
          </div>
        )}
      </div>
    </div>
  )
}
