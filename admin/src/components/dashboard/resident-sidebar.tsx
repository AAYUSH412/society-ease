"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
}

const residentSidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/resident/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions",
  },
  {
    title: "My Bills",
    href: "/resident/bills",
    icon: CreditCard,
    badge: 2,
    description: "View and pay maintenance bills",
  },
  {
    title: "Payment History",
    href: "/resident/payments",
    icon: Receipt,
    description: "Track your payment history",
  },
  {
    title: "File Complaint",
    href: "/resident/complaints",
    icon: MessageSquare,
    description: "Submit and track complaints",
  },
  {
    title: "My Complaints",
    href: "/resident/complaints/history",
    icon: History,
    badge: 1,
    description: "View complaint status",
  },
  {
    title: "Notices",
    href: "/resident/notices",
    icon: Bell,
    badge: 3,
    description: "Society announcements",
  },
  {
    title: "Directory",
    href: "/resident/directory",
    icon: BookOpen,
    description: "Society member directory",
  },
  {
    title: "Events",
    href: "/resident/events",
    icon: Calendar,
    description: "Society events and meetings",
  },
  {
    title: "Emergency",
    href: "/resident/emergency",
    icon: Phone,
    description: "Emergency contacts",
  },
  {
    title: "Announcements",
    href: "/resident/announcements",
    icon: Megaphone,
    description: "Important announcements",
  },
  {
    title: "Profile",
    href: "/resident/profile",
    icon: User,
    description: "Manage your profile",
  },
]

interface ResidentSidebarProps {
  className?: string
  isCollapsed?: boolean
}

export function ResidentSidebar({ className, isCollapsed = false }: ResidentSidebarProps) {
  const pathname = usePathname()

  const renderSidebarItem = (item: SidebarItem) => {
    const isActive = pathname === item.href

    return (
      <Button
        key={item.title}
        variant="ghost"
        asChild
        className={cn(
          "w-full justify-start text-left h-auto py-3 px-3",
          isActive && "bg-accent text-accent-foreground border-r-2 border-primary",
          isCollapsed && "justify-center px-2"
        )}
      >
        <Link href={item.href}>
          <div className="flex items-center w-full">
            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant={typeof item.badge === 'string' ? 'secondary' : 'destructive'} 
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </Link>
      </Button>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
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
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Pending Bills</span>
              </div>
              <Badge variant="outline">2</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Open Complaints</span>
              </div>
              <Badge variant="outline">1</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {residentSidebarItems.map((item) => renderSidebarItem(item))}
      </nav>

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
  )
}
