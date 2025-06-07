import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
      <div className="absolute inset-0 bg-background/10 backdrop-blur-sm" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 bg-white/10 backdrop-blur-md shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Ready to Transform Your Society?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join hundreds of societies already using Society Ease to streamline their operations, 
                improve transparency, and enhance community satisfaction.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
              >
                <Link href="/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link href="/demo">
                  Schedule a Demo
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-white/80 text-sm">
                Trusted by 500+ societies • 99.9% uptime • ISO 27001 certified
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
