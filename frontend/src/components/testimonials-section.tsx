import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Society Secretary",
    society: "Green Valley Apartments",
    image: "/placeholder-avatar-1.jpg",
    content: "Society Ease has revolutionized how we manage our 150-unit complex. The digital billing system alone has increased our collection efficiency by 40%. Highly recommended!",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Resident",
    society: "Sunrise Heights",
    image: "/placeholder-avatar-2.jpg",
    content: "Finally, no more missed notices or payment delays! The real-time alerts feature is a game-changer. I love how transparent everything has become.",
    rating: 5
  },
  {
    name: "Dr. Amit Patel",
    role: "Committee Member",
    society: "Heritage Gardens",
    image: "/placeholder-avatar-3.jpg",
    content: "The complaint management system is incredibly efficient. We've reduced resolution time from weeks to just 2-3 days. Our residents are much happier now.",
    rating: 5
  },
  {
    name: "Sneha Reddy",
    role: "Property Manager",
    society: "Royal Palms",
    image: "/placeholder-avatar-4.jpg",
    content: "Managing multiple societies was a nightmare before Society Ease. Now I can handle everything from one dashboard. The time savings are incredible!",
    rating: 5
  },
  {
    name: "Vikram Singh",
    role: "Treasurer",
    society: "Lakeside Villa",
    image: "/placeholder-avatar-5.jpg",
    content: "The financial transparency this platform provides is outstanding. Parents and residents can see exactly where their money is going. Trust has increased significantly.",
    rating: 5
  },
  {
    name: "Meera Joshi",
    role: "Resident",
    society: "Garden City",
    image: "/placeholder-avatar-6.jpg",
    content: "Love the mobile-responsive design! I can pay bills, check notices, and report issues right from my phone. So convenient and user-friendly.",
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Societies Everywhere
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what society residents are saying about their experience 
            with our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden border-0 bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.society}
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Gradient overlay for visual appeal */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3 text-center">
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              500+
            </div>
            <div className="text-muted-foreground">Societies Using Our Platform</div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              50,000+
            </div>
            <div className="text-muted-foreground">Happy Residents</div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              4.9/5
            </div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}
