import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" },
      { name: "Security", href: "/security" },
      { name: "Integrations", href: "/integrations" }
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Press", href: "/press" },
      { name: "Partners", href: "/partners" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Status", href: "/status" },
      { name: "Changelog", href: "/changelog" }
    ]
  }
]

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "Instagram", href: "#", icon: Instagram }
]

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Society Ease
                </span>
              </Link>
              
              <p className="text-muted-foreground mb-6 max-w-md">
                Transforming traditional society management into a comprehensive digital platform 
                that enhances transparency, efficiency, and communication for residents.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>contact@societyease.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <Button key={social.name} variant="ghost" size="icon" asChild>
                      <Link href={social.href} aria-label={social.name}>
                        <IconComponent className="h-5 w-5" />
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 Society Ease. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/cookies" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
