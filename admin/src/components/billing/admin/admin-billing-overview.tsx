"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardGrid, StatsCard } from "@/components/dashboard/dashboard-content"
import { 
  DollarSign, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Plus
} from "lucide-react"
import { 
  getAdminBillingStats, 
  getAdminRecentActivity,
  AdminBillingStats,
  AdminRecentActivity
} from "@/lib/api/admin-billing"

interface AdminBillingOverviewProps {
  onCreateBills: () => void
}

export function AdminBillingOverview({ onCreateBills }: AdminBillingOverviewProps) {
  const [stats, setStats] = useState<AdminBillingStats>({
    totalRevenue: 0,
    totalPending: 0,
    collectionRate: 0,
    totalResidents: 0,
    billsGenerated: 0,
    paymentsPending: 0
  })
  const [recentActivity, setRecentActivity] = useState<AdminRecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch billing stats and recent activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        getAdminBillingStats(),
        getAdminRecentActivity()
      ])

      setStats(statsResponse.data)
      setRecentActivity(activityResponse.data)
    } catch (err) {
      console.error('Error fetching billing data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch billing data')
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      title: "Total Revenue",
      value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`,
      description: "This month",
      icon: DollarSign,
      trend: { value: "12%", isPositive: true },
    },
    {
      title: "Pending Amount",
      value: `₹${(stats.totalPending / 1000).toFixed(0)}K`,
      description: "Outstanding dues",
      icon: AlertCircle,
      trend: { value: "5%", isPositive: false },
    },
    {
      title: "Collection Rate",
      value: `${stats.collectionRate}%`,
      description: "Payment success",
      icon: TrendingUp,
      trend: { value: "3%", isPositive: true },
    },
    {
      title: "Active Residents",
      value: stats.totalResidents.toString(),
      description: "Total units",
      icon: Users,
      trend: { value: "2", isPositive: true },
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardGrid cols={4}>
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </DashboardGrid>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Billing Data</h3>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
              <Button onClick={fetchBillingData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <DashboardGrid cols={4}>
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </DashboardGrid>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common billing operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={onCreateBills} 
              className="w-full justify-start" 
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Monthly Bills
            </Button>
            
            <Button 
              onClick={() => {
                // Handle sending payment reminders
                console.log('Sending payment reminders');
                // You can implement actual functionality or navigation here
              }} 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Send Payment Reminders
            </Button>
            
            <Button 
              onClick={() => {
                // Navigate to reports page
                window.location.href = '/billing/reports';
              }} 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Reports
            </Button>
            
            <Button 
              onClick={() => {
                // Navigate to resident management
                window.location.href = '/users';
              }} 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Residents
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest billing and payment updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="mt-0.5">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Collection Progress</CardTitle>
          <CardDescription>
            Payment collection status for current billing period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                ₹{stats.totalRevenue.toLocaleString()} collected of ₹{(stats.totalRevenue + stats.totalPending).toLocaleString()} total
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.billsGenerated} bills generated, {stats.paymentsPending} payments pending
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{stats.collectionRate}%</p>
              <p className="text-xs text-muted-foreground">Collection Rate</p>
            </div>
          </div>
          <Progress value={stats.collectionRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start of Month</span>
            <span>Target: 95%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
