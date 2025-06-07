import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small societies",
    price: "₹2,999",
    period: "/month",
    features: [
      "Up to 50 units",
      "Digital billing & payments",
      "Basic complaint management",
      "Notice board",
      "Email support",
      "Mobile responsive"
    ],
    popular: false,
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    description: "Most popular for growing societies",
    price: "₹4,999",
    period: "/month",
    features: [
      "Up to 200 units",
      "All Starter features",
      "Real-time alerts",
      "Parking violation management",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "Resident training"
    ],
    popular: true,
    cta: "Get Started"
  },
  {
    name: "Enterprise",
    description: "For large societies & complexes",
    price: "Custom",
    period: "",
    features: [
      "Unlimited units",
      "All Professional features",
      "Dedicated account manager",
      "Custom development",
      "API access",
      "24/7 phone support",
      "On-site training",
      "White-label options"
    ],
    popular: false,
    cta: "Contact Sales"
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your society. All plans include a 30-day free trial 
            with no setup fees or hidden charges.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden ${
                plan.popular 
                  ? 'border-2 border-primary shadow-lg scale-105' 
                  : 'border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-b-lg text-sm font-medium">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="ml-3 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Need a custom solution? Our team can help you build the perfect platform for your society.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">
              Schedule a Demo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
