"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViolationStatusBadge } from "@/components/shared/violation-status-badge"
import { ViolationTypeIcon } from "@/components/shared/violation-type-icon"
import * as violationApi from "@/lib/api/parking/violations"
import * as analyticsApi from "@/lib/api/parking/analytics"
import {
  RefreshCw,
  Download,
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react"

interface ParkingOverview {
  totalViolations: number
  pendingReview: number
  resolvedToday: number
  totalFines: number
  averageResolutionTime: number
  mostCommonViolation: string
  activeViolators: number
  monthlyTrend: number
}

interface RecentViolation {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  status: "pending" | "under_review" | "resolved" | "dismissed"
  residentName: string
  location: string
  reportedAt: string
  fineAmount?: number
}

export function ParkingOverview() {
  const [overview, setOverview] = useState<ParkingOverview | null>(null)
  const [recentViolations, setRecentViolations] = useState<RecentViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedViolations, setSelectedViolations] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    severity: "",
    dateRange: null as {from: Date, to: Date} | null,
  })

  useEffect(() => {
    loadOverviewData()
    loadRecentViolations()
  }, [])

  const loadOverviewData = async () => {
    try {
      const stats = await analyticsApi.getDashboardStats()
      
      setOverview({
        totalViolations: stats.data.monthStats.newViolations,
        pendingReview: stats.data.pendingActions.pendingReviews,
        resolvedToday: stats.data.todayStats.reviewsCompleted,
        totalFines: stats.data.monthStats.collectionAmount,
        averageResolutionTime: 24, // Default value as this data is not available in DashboardStats
        mostCommonViolation: "Unauthorized Parking", // Default value
        activeViolators: 10, // Default value
        monthlyTrend: 5.2, // Default value
      })
    } catch (error) {
      console.error("Failed to load overview data:", error)
    }
  }

  const loadRecentViolations = async () => {
    try {
      const response = await violationApi.getAllViolations({
        limit: 10,
        sortBy: "reportedAt",
        sortOrder: "desc",
      })
      
      // Map ParkingViolation to RecentViolation format
      const mappedViolations: RecentViolation[] = response.data.violations.map(violation => ({
        id: violation._id,
        type: violation.category.name,
        severity: violation.category.severity === 'critical' ? 'high' : violation.category.severity,
        status: violation.status === 'approved' ? 'resolved' : 
                violation.status === 'rejected' ? 'dismissed' : 
                violation.status as "pending" | "under_review" | "resolved" | "dismissed",
        residentName: violation.violatedBy.ownerName || `Flat ${violation.violatedBy.flatNumber}`,
        location: violation.location.area,
        reportedAt: violation.incidentDateTime,
        fineAmount: violation.adminReview?.fineAmount,
      }))
      
      setRecentViolations(mappedViolations)
    } catch (error) {
      console.error("Failed to load recent violations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([loadOverviewData(), loadRecentViolations()])
    setLoading(false)
  }

  const handleExportData = async () => {
    try {
      await analyticsApi.exportAnalyticsReport(
        "comprehensive",
        {
          format: "excel",
          dateFrom: filters.dateRange?.from.toISOString(),
          dateTo: filters.dateRange?.to.toISOString(),
          status: filters.status,
          category: filters.type,
          severity: filters.severity,
        }
      )
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const handleBulkAction = async (action: string, violationIds: string[]) => {
    try {
      // Map actions to the correct API action values
      const actionMap = {
        "approve": "approve",
        "reject": "reject", 
        "review": "dismiss"
      } as const
      
      const apiAction = actionMap[action as keyof typeof actionMap]
      if (apiAction) {
        await violationApi.bulkReviewViolations({
          violationIds,
          action: apiAction,
          notes: `Bulk ${action} action performed`
        })
      }
      
      setSelectedViolations([])
      await loadRecentViolations()
    } catch (error) {
      console.error("Failed to perform bulk action:", error)
    }
  }

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parking Violations</h1>
          <p className="text-muted-foreground">
            Monitor and manage parking violations across the society
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalViolations || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.pendingReview || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{overview?.totalFines || 0}</div>
            <p className="text-xs text-muted-foreground">Collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.averageResolutionTime || 0}h</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Review</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {recentViolations.filter(v => v.severity === "high" && v.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">High severity pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {recentViolations.filter(v => v.status === "under_review").length}
                </div>
                <p className="text-xs text-muted-foreground">Under review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {overview?.resolvedToday || 0}
                </div>
                <p className="text-xs text-muted-foreground">Completed today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(overview?.monthlyTrend ?? 0) > 0 ? "+" : ""}{overview?.monthlyTrend ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Violations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Violations</CardTitle>
              <CardDescription>
                Latest parking violations requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentViolations.slice(0, 5).map((violation) => (
                  <div
                    key={violation.id}
                    className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <ViolationTypeIcon type={violation.type} className="h-8 w-8" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{violation.residentName}</p>
                        <ViolationStatusBadge status={violation.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {violation.type} • {violation.location} • {new Date(violation.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {violation.fineAmount ? `₹${violation.fineAmount}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {violation.severity} priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter violations by status, type, and severity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <select
                    id="status"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="type" className="text-sm font-medium">Type</label>
                  <select
                    id="type"
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="unauthorized_parking">Unauthorized Parking</option>
                    <option value="overtime_parking">Overtime Parking</option>
                    <option value="disabled_spot">Disabled Spot Violation</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="severity" className="text-sm font-medium">Severity</label>
                  <select
                    id="severity"
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedViolations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>{selectedViolations.length} violations selected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleBulkAction("approve", selectedViolations)}
                  >
                    Approve Selected
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleBulkAction("reject", selectedViolations)}
                  >
                    Reject Selected
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedViolations([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Violations Table</CardTitle>
              <CardDescription>Recent violations matching your filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentViolations.map((violation) => (
                  <div
                    key={violation.id}
                    className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedViolations.includes(violation.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedViolations(prev => [...prev, violation.id])
                        } else {
                          setSelectedViolations(prev => prev.filter(id => id !== violation.id))
                        }
                      }}
                      className="rounded"
                    />
                    <ViolationTypeIcon type={violation.type} className="h-8 w-8" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{violation.residentName}</p>
                        <ViolationStatusBadge status={violation.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {violation.type} • {violation.location} • {new Date(violation.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {violation.fineAmount ? `₹${violation.fineAmount}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {violation.severity} priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>View detailed analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Manage violation categories and types</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Category management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure parking violation management settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings panel coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
