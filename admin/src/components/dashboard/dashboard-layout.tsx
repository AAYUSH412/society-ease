"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DashboardHeader } from "./dashboard-header"
import { AdminSidebar } from "./admin-sidebar"
import { ResidentSidebar } from "./resident-sidebar"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "admin" | "resident"
  userName: string
  userEmail: string
  notifications?: number
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  userEmail,
  notifications = 0,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarCollapsed(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const SidebarComponent = userRole === "admin" ? AdminSidebar : ResidentSidebar

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarComponent />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "relative border-r bg-background transition-all duration-300 ease-in-out",
              sidebarCollapsed ? "w-16" : "w-64"
            )}
          >
            {/* Collapse Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-3 w-3" />
              ) : (
                <PanelLeftClose className="h-3 w-3" />
              )}
            </Button>

            <SidebarComponent isCollapsed={sidebarCollapsed} />
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            onSidebarToggle={toggleSidebar}
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
            notifications={notifications}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
