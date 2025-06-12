"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  Bell,
  Shield,
  Settings,
  BarChart3,
  Building2,
  Calendar,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Database,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react"
import { useState } from "react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: SidebarItem[]
}

const adminSidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    badge: "New",
  },
  {
    title: "Billing & Payments",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquare,
    badge: 8,
    children: [
      {
        title: "All Complaints",
        href: "/complaints",
        icon: MessageSquare,
      },
      {
        title: "Pending Resolution",
        href: "/complaints/pending",
        icon: AlertTriangle,
        badge: 8,
      },
      {
        title: "Resolved",
        href: "/complaints/resolved",
        icon: Shield,
      },
    ],
  },
  {
    title: "Notices",
    href: "/notices",
    icon: Bell,
    children: [
      {
        title: "Create Notice",
        href: "/notices/create",
        icon: FileText,
      },
      {
        title: "Emergency Alerts",
        href: "/notices/alerts",
        icon: AlertTriangle,
      },
      {
        title: "Scheduled Notices",
        href: "/notices/scheduled",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Alerts",
    href: "/admin/alerts",
    icon: Bell,
    children: [
      {
        title: "Dashboard",
        href: "/admin/alerts",
        icon: BarChart3,
      },
      {
        title: "Create Alert",
        href: "/admin/alerts/create",
        icon: Plus,
      },
      {
        title: "Manage Alerts",
        href: "/admin/alerts/manage",
        icon: Settings,
      },
    ],
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    children: [
      {
        title: "Service Requests",
        href: "/maintenance/requests",
        icon: Wrench,
      },
      {
        title: "Vendor Management",
        href: "/maintenance/vendors",
        icon: Users,
      },
      {
        title: "Asset Management",
        href: "/maintenance/assets",
        icon: Database,
      },
    ],
  },
  {
    title: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    children: [
      {
        title: "Financial Reports",
        href: "/reports/financial",
        icon: CreditCard,
      },
      {
        title: "User Activity",
        href: "/reports/activity",
        icon: Users,
      },
      {
        title: "System Analytics",
        href: "/reports/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      {
        title: "Society Settings",
        href: "/settings/society",
        icon: Building2,
      },
      {
        title: "System Configuration",
        href: "/settings/system",
        icon: Settings,
      },
      {
        title: "Security",
        href: "/settings/security",
        icon: Shield,
      },
    ],
  },
]

interface AdminSidebarProps {
  className?: string
  isCollapsed?: boolean
}

export function AdminSidebar({ className, isCollapsed = false }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const isItemActive = (item: SidebarItem): boolean => {
    if (pathname === item.href) return true
    if (item.children) {
      return item.children.some((child) => pathname === child.href)
    }
    return false
  }

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const isActive = isItemActive(item)

    return (
      <div key={item.title}>
        {hasChildren ? (
          <Button
            variant="ghost"
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full justify-start text-left h-auto py-2 px-3",
              level > 0 && "ml-4 text-sm",
              isActive && "bg-accent text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2" />
                )}
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start text-left h-auto py-2 px-3",
              level > 0 && "ml-4 text-sm",
              pathname === item.href && "bg-accent text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Link href={item.href}>
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          </Button>
        )}

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-2 mt-1 space-y-1">
            {item.children?.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Society Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminSidebarItems.map((item) => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {!isCollapsed && (
            <>
              <p>Society Ease v2.0</p>
              <p className="mt-1">Admin Dashboard</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
