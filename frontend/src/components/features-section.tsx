import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Bell, 
  FileText, 
  MessageSquare, 
  Car, 
  Users,
  Shield,
  Smartphone,
  Clock
} from "lucide-react"

const features = [
  {
    icon: CreditCard,
    title: "Digital Billing System",
    description: "Generate, track, and collect maintenance bills online with automated reminders and multiple payment options.",
    highlights: ["Online payments", "Loyalty rewards", "Auto-reminders"],
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Instant notifications for water, electricity, or maintenance outages with priority-based delivery.",
    highlights: ["Instant notifications", "Priority alerts", "Multi-channel"],
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: MessageSquare,
    title: "Complaint Management",
    description: "Submit, track, and resolve complaints efficiently with transparent communication and photo attachments.",
    highlights: ["Photo attachments", "Status tracking", "Resolution analytics"],
    gradient: "from-purple-500 to-violet-500"
  },
  {
    icon: FileText,
    title: "Digital Notice Board",
    description: "Publish notices, announcements, and circulars digitally with scheduled publishing and read confirmations.",
    highlights: ["Scheduled publishing", "Read confirmations", "Archive management"],
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Car,
    title: "Parking Management",
    description: "Report and manage parking violations with photo evidence and automated fine management.",
    highlights: ["Photo evidence", "Violation tracking", "Fine management"],
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: Users,
    title: "User Management",
    description: "Secure registration with role-based access and email verification.",
    highlights: ["Email verification", "Secure access"],
    gradient: "from-teal-500 to-cyan-500"
  }
]

const additionalFeatures = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security protocols"
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Perfect experience across all devices"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer assistance"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Society Management
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From digital billing to real-time alerts, our platform covers all aspects of community management
            with cutting-edge technology and intuitive design.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="grid gap-6 md:grid-cols-3">
          {additionalFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="flex items-center space-x-4 p-6 rounded-lg bg-gradient-to-br from-muted/50 to-background border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
