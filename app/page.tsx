import { Upload, Sparkles, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-balance text-foreground">Admeme</h1>
          </div>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Transform your products into viral memes with AI-powered creativity. Upload, describe, and watch the magic
            happen.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-all duration-300 border-primary/30 hover:border-primary bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-foreground">Upload & Describe</CardTitle>
              <CardDescription>Upload your product image and add a description to get started</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 border-secondary/30 hover:border-secondary bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Zap className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-foreground">AI Processing</CardTitle>
              <CardDescription>Our AI analyzes trends, generates captions, and predicts virality</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 border-accent/30 hover:border-accent bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-foreground">Viral Results</CardTitle>
              <CardDescription>
                Get multiple meme variations with safety scores and virality predictions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary">Ready to Create Viral Memes?</CardTitle>
              <CardDescription>Start generating AI-powered memes for your products in seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/generate">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg"
                >
                  Start Generating
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/history">
            <Button
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent shadow-sm"
            >
              View History
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-white bg-transparent shadow-sm"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
