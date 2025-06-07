"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ParkingOverview, ViolationStatsCards } from "@/components/parking"
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileText,
  Settings,
  Eye
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface ParkingStats {
  totalViolations: number
  pendingReview: number
  resolvedToday: number
  totalFines: number
  averageResolutionTime: number
  mostCommonViolation: string
  activeViolators: number
  monthlyTrend: number
}

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
}

interface ParkingAlert {
  id: string
  type: 'overdue' | 'high_priority' | 'system' | 'warning'
  title: string
  message: string
  timestamp: string
  actionRequired: boolean
}

export default function ParkingDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ParkingStats | null>(null)
  const [alerts, setAlerts] = useState<ParkingAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      setStats({
        totalViolations: 150,
        pendingReview: 25,
        resolvedToday: 8,
        totalFines: 45000,
        averageResolutionTime: 2.5,
        mostCommonViolation: "Unauthorized Parking",
        activeViolators: 12,
        monthlyTrend: 15
      })
      
      setAlerts([
        {
          id: "1",
          type: "high_priority",
          title: "High Priority Violations",
          message: "5 critical violations require immediate review",
          timestamp: new Date().toISOString(),
          actionRequired: true
        }
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      title: "Review Violations",
      description: "Process pending violations",
      icon: AlertTriangle,
      href: "/parking/violations/pending",
      color: "bg-orange-500"
    },
    {
      title: "View All Violations",
      description: "Browse complete violation list",
      icon: Eye,
      href: "/parking/violations",
      color: "bg-blue-500"
    },
    {
      title: "Manage Categories",
      description: "Configure violation types",
      icon: Settings,
      href: "/parking/categories",
      color: "bg-purple-500"
    },
    {
      title: "Fine Management",
      description: "Track and manage fines",
      icon: FileText,
      href: "/parking/fines",
      color: "bg-green-500"
    }
  ]

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'overdue': return 'destructive'
      case 'high_priority': return 'default'
      case 'warning': return 'default'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || "admin@societyease.com"}
        notifications={5}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole="admin"
      userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
      userEmail={user?.email || "admin@societyease.com"}
      notifications={5}
    >
      <DashboardContent
        title="Parking Management"
        description="Monitor and manage parking violations across the society"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/parking/violations/analytics")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => router.push("/parking/violations/pending")}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Review Violations
            </Button>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <ViolationStatsCards overview={stats} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common parking management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <Card 
                      key={action.title}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(action.href)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${action.color} text-white`}>
                            <action.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{action.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overview Component */}
            <ParkingOverview />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest parking violations and administrative actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Loading recent activity...
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Important notifications requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No alerts at this time</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm mt-1">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {alert.actionRequired && (
                              <Badge variant="destructive" className="ml-2">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardContent>
    </DashboardLayout>
  )
}
