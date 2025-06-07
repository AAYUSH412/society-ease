import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 right-0 -mt-40 -mr-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-600/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-40 -ml-40 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-400/30 to-pink-600/30 blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Star className="mr-2 h-4 w-4" />
              Trusted by 500+ societies nationwide
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Transform Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Society Management
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl lg:mx-auto lg:max-w-3xl">
            Go paperless with our comprehensive digital platform. Manage maintenance bills, 
            track complaints, receive alerts, and communicate seamlessly with your community.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="grid gap-6 sm:grid-cols-3 lg:mx-auto lg:max-w-4xl">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold">90%</div>
                <p className="text-sm text-muted-foreground">Reduction in Paper Usage</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-sm text-muted-foreground">On-time Payment Collection</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold">60%</div>
                <p className="text-sm text-muted-foreground">Time Savings for Residents</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
