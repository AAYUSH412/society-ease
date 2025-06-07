"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/hooks/use-auth"
import {
  Bell,
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  MessageSquare,
  CreditCard,
  Building2,
} from "lucide-react"
import { AlertNotificationBadge } from "@/components/alerts/resident/AlertNotificationBadge"

interface DashboardHeaderProps {
  onSidebarToggle: () => void
  userName: string
  userEmail: string
  userRole?: string
  notifications?: number
}

export function DashboardHeader({
  onSidebarToggle,
  userName,
  userEmail,
  userRole = "resident",
  notifications = 0,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleNotificationClick = () => {
    // Navigate to notifications page based on user role
    if (userRole === "admin") {
      router.push("/admin/notifications")
    } else {
      router.push("/resident/notifications")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Society Ease</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole} Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Alert Notifications for Residents */}
          <AlertNotificationBadge />
          
          {/* General Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {notifications > 99 ? "99+" : notifications}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/resident/alerts/create')}>
                <Bell className="mr-2 h-4 w-4" />
                Create Alert
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/resident/complaints')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                File Complaint
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/resident/billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                View Bills
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                  <Badge variant="outline" className="w-fit mt-1 capitalize">
                    {userRole}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/resident/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/resident/billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/resident/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
