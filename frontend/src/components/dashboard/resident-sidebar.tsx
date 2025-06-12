"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  CreditCard,
  MessageSquare,
  Bell,
  Car,
  User,
  Calendar,
  Phone,
  Building2,
  History,
  Receipt,
  AlertCircle,
  BookOpen,
  Megaphone,
  Shield,
  Wallet,
  Settings,
  HelpCircle,
  ChevronRight,
  DollarSign,
  Users,
  Activity,
  Zap,
} from "lucide-react"

interface SidebarItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  children?: SidebarItem[]
  isNew?: boolean
  isPro?: boolean
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const residentSidebarSections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/resident/dashboard",
        icon: LayoutDashboard,
        description: "Your personal overview",
      },
      {
        title: "Quick Actions",
        href: "/resident/quick-actions",
        icon: Zap,
        description: "Fast access to common tasks",
        isNew: true,
      },
    ],
  },
  {
    title: "Alerts & Communications",
    items: [
      {
        title: "Alerts",
        icon: Shield,
        badge: 3,
        description: "Emergency and priority alerts",
        children: [
          {
            title: "View All Alerts",
            href: "/resident/alerts",
            icon: AlertCircle,
            description: "All alerts and warnings",
          },
          {
            title: "Create Alert",
            href: "/resident/alerts/create",
            icon: Bell,
            description: "Report new incidents",
          },
          {
            title: "Notifications",
            href: "/resident/alerts/notifications",
            icon: Bell,
            badge: 2,
            description: "Alert notifications",
          },
        ],
      },
      {
        title: "Notices",
        href: "/resident/notices",
        icon: Bell,
        badge: 5,
        description: "Society announcements",
      },
      {
        title: "Announcements",
        href: "/resident/announcements",
        icon: Megaphone,
        description: "Community updates",
      },
    ],
  },
  {
    title: "Financial",
    items: [
      {
        title: "Billing",
        href: "/resident/billing",
        icon: DollarSign,
        description: "Manage your payments",
      },
      {
        title: "Payment Details",
        icon: CreditCard,
        description: "Payment management",
        children: [
          {
            title: "My Bills",
            href: "/resident/bills",
            icon: CreditCard,
            badge: 2,
            description: "View pending bills",
          },
          {
            title: "Payment History",
            href: "/resident/payments",
            icon: Receipt,
            description: "Track past payments",
          },
          {
            title: "Auto-Pay Setup",
            href: "/resident/autopay",
            icon: Wallet,
            description: "Set up automatic payments",
            isNew: true,
          },
        ],
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "Complaints",
        icon: MessageSquare,
        description: "Report and track issues",
        children: [
          {
            title: "File Complaint",
            href: "/resident/complaints",
            icon: MessageSquare,
            description: "Report new issues",
          },
          {
            title: "My Complaints",
            href: "/resident/complaints/history",
            icon: History,
            badge: 1,
            description: "Track complaint status",
          },
        ],
      },
      {
        title: "Visitor Management",
        href: "/resident/visitors",
        icon: Users,
        description: "Pre-approve visitors",
        isNew: true,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        title: "Directory",
        href: "/resident/directory",
        icon: BookOpen,
        description: "Society member contacts",
      },
      {
        title: "Events",
        href: "/resident/events",
        icon: Calendar,
        description: "Community events",
      },
      {
        title: "Amenities",
        href: "/resident/amenities",
        icon: Activity,
        description: "Book common facilities",
        isPro: true,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Emergency",
        href: "/resident/emergency",
        icon: Phone,
        description: "Emergency contacts",
      },
      {
        title: "Help & Support",
        href: "/resident/help",
        icon: HelpCircle,
        description: "Get assistance",
      },
      {
        title: "Profile",
        href: "/resident/profile",
        icon: User,
        description: "Manage your profile",
      },
      {
        title: "Settings",
        href: "/resident/settings",
        icon: Settings,
        description: "App preferences",
      },
    ],
  },
]

interface ResidentSidebarProps {
  className?: string
  isCollapsed?: boolean
}

export function ResidentSidebar({ className, isCollapsed = false }: ResidentSidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Initialize expanded sections for sections with children
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {}
    residentSidebarSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          // Auto-expand if current route matches any child
          const hasActiveChild = item.children.some(child => pathname === child.href)
          initialExpanded[item.title] = hasActiveChild
        }
      })
    })
    setExpandedSections(initialExpanded)
  }, [pathname])

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderMenuItem = (item: SidebarItem, isChild = false) => {
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections[item.title]

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isExpanded}
          onOpenChange={() => toggleSection(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto py-3 px-3",
                isCollapsed && "justify-center px-2"
              )}
            >
              <div className="flex items-center w-full">
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.title}</span>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge 
                            variant={typeof item.badge === 'string' ? 'secondary' : 'destructive'} 
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            New
                          </Badge>
                        )}
                        {item.isPro && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            Pro
                          </Badge>
                        )}
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded && "rotate-90"
                          )} 
                        />
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>

          {!isCollapsed && (
            <CollapsibleContent className="space-y-1">
              <div className="ml-6 space-y-1">
                {item.children?.map((child) => renderMenuItem(child, true))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      )
    }

    // Regular menu item (with or without link)
    const content = (
      <div className="flex items-center w-full">
        <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.title}</span>
              <div className="flex items-center gap-1">
                {item.badge && (
                  <Badge 
                    variant={typeof item.badge === 'string' ? 'secondary' : 'destructive'} 
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.isNew && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    New
                  </Badge>
                )}
                {item.isPro && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                    Pro
                  </Badge>
                )}
              </div>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {item.description}
              </p>
            )}
          </div>
        )}
      </div>
    )

    if (item.href) {
      if (isCollapsed) {
        return (
          <TooltipProvider key={item.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-center px-2 py-3 h-auto",
                    isActive && "bg-accent text-accent-foreground border-r-2 border-primary",
                    isChild && "ml-6"
                  )}
                >
                  <Link href={item.href}>
                    {content}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={typeof item.badge === 'string' ? 'secondary' : 'destructive'} 
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return (
        <Button
          key={item.title}
          variant="ghost"
          asChild
          className={cn(
            "w-full justify-start text-left h-auto py-3 px-3",
            isActive && "bg-accent text-accent-foreground border-r-2 border-primary",
            isChild && "ml-6"
          )}
        >
          <Link href={item.href}>
            {content}
          </Link>
        </Button>
      )
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start text-left h-auto py-3 px-3",
          isChild && "ml-6"
        )}
      >
        {content}
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold">Resident Portal</h2>
                <p className="text-xs text-muted-foreground">Society Services</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="p-4 border-b">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending Bills</span>
                </div>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Open Complaints</span>
                </div>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">New Alerts</span>
                </div>
                <Badge variant="outline">3</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {residentSidebarSections.map((section) => (
                <div key={section.title}>
                  {!isCollapsed && (
                    <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => renderMenuItem(item))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            {!isCollapsed && (
              <>
                <p>Society Ease v2.0</p>
                <p className="mt-1">Resident Dashboard</p>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
