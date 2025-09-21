"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, ImageIcon, FileText, Loader2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function GeneratePage() {
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productImage, setProductImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        router.push("/auth/login")
      }
    }
    getUser()
  }, [supabase.auth, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName || !productDescription || !user) return

    setIsLoading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("productName", productName)
      formData.append("productDescription", productDescription)
      formData.append("userId", user.id)
      if (productImage) {
        formData.append("productImage", productImage)
      }

      const response = await fetch("/api/generate-memes", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/results/${result.generationId}`)
      } else {
        console.error("Failed to generate memes")
      }
    } catch (error) {
      console.error("Error generating memes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking authentication...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance text-foreground">Generate Memes</h1>
          <p className="text-muted-foreground">Upload your product and let AI create viral memes</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Name */}
            <Card className="border-primary/30 hover:border-primary/50 transition-colors bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  Product Information
                </CardTitle>
                <CardDescription>Tell us about your product to generate relevant memes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Wireless Headphones Pro"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productDescription">Product Description</Label>
                  <Textarea
                    id="productDescription"
                    placeholder="Describe your product's key features, benefits, and target audience..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="border-secondary/30 hover:border-secondary/50 transition-colors bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ImageIcon className="h-5 w-5 text-secondary" />
                  Product Image
                </CardTitle>
                <CardDescription>Upload an image of your product (optional but recommended)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="productImage"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-secondary/40 rounded-lg cursor-pointer bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Product preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      <input
                        id="productImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {productImage && <p className="text-sm text-muted-foreground">Selected: {productImage.name}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg"
                  disabled={isLoading || !productName || !productDescription}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Memes...
                    </>
                  ) : (
                    <>
                      Generate Memes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                {isLoading && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-muted-foreground text-center">AI is working its magic...</div>
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <div className="text-primary">🔍 Scraping trending topics...</div>
                      <div className="text-secondary">🤖 Generating creative captions...</div>
                      <div className="text-accent">📊 Predicting virality scores...</div>
                      <div className="text-primary">🛡️ Checking content safety...</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
