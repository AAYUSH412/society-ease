"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent, DashboardGrid, StatsCard } from "@/components/dashboard/dashboard-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Building, 
  Users, 
  Receipt, 
  DollarSign,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const statsData = [
    {
      title: "Total Residents",
      value: "245",
      description: "Active residents",
      icon: Users,
      trend: { value: "12%", isPositive: true },
    },
    {
      title: "Monthly Revenue",
      value: "₹4.2L",
      description: "This month",
      icon: DollarSign,
      trend: { value: "8%", isPositive: true },
    },
    {
      title: "Outstanding Dues",
      value: "₹85K",
      description: "Pending payments",
      icon: AlertTriangle,
      trend: { value: "5%", isPositive: false },
    },
    {
      title: "Collection Rate",
      value: "94%",
      description: "Payment success",
      icon: TrendingUp,
      trend: { value: "3%", isPositive: true },
    },
  ]

  return (
    <DashboardLayout
      userRole="admin"
      userName={user?.firstName ? `${user.firstName} ${user.lastName}` : "Admin"}
      userEmail={user?.email || "admin@email.com"}
      notifications={5}
    >
      <DashboardContent
        title="Admin Dashboard"
        description="Welcome to Society Ease Admin Panel"
      >
        {/* Stats Grid */}
        <DashboardGrid cols={4}>
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </DashboardGrid>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/billing')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing Management
              </CardTitle>
              <CardDescription>
                Generate bills, track payments, and manage billing operations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/users')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage residents, approvals, and user permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Society Settings
              </CardTitle>
              <CardDescription>
                Configure society details and system settings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and actions in your society</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Receipt className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Monthly bills generated for December 2024</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Users className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New resident registration approved</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received from Flat 304</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardContent>
    </DashboardLayout>
  )
}
