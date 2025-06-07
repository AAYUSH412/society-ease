"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, FileText, BarChart3, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getViolationAnalytics, exportAnalyticsReport, ViolationAnalytics } from "@/lib/api/parking/analytics"
import { toast } from "sonner"

interface DateRange {
  from?: Date
  to?: Date
}

export default function ViolationAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State management
  const [analyticsData, setAnalyticsData] = useState<ViolationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date()
    const from = new Date()
    from.setMonth(from.getMonth() - 6) // Last 6 months
    return { from, to }
  })
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [isExporting, setIsExporting] = useState(false)

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getViolationAnalytics({
        dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
        dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
        granularity: groupBy === 'day' ? 'daily' : groupBy === 'week' ? 'weekly' : 'monthly'
      })
      
      if (response.success && response.data) {
        setAnalyticsData(response.data)
      }
    } catch (error) {
      console.error("Error loading analytics data:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }, [dateRange, groupBy])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' | 'excel' = 'pdf') => {
    try {
      setIsExporting(true)
      const reportType: 'comprehensive' | 'compliance' | 'financial' | 'operational' = 'comprehensive'
      const blob = await exportAnalyticsReport(reportType, {
        format,
        dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
        dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
        granularity: groupBy === 'day' ? 'daily' : groupBy === 'week' ? 'weekly' : 'monthly',
        includeCharts: format === 'pdf'
      })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `parking-analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Analytics report exported successfully`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export analytics report")
    } finally {
      setIsExporting(false)
    }
  }

  // Calculate key metrics
  const getKeyMetrics = () => {
    if (!analyticsData) return null
    
    const { overview } = analyticsData
    return {
      resolutionRate: overview.totalViolations > 0 
        ? Math.round((overview.resolvedViolations / overview.totalViolations) * 100)
        : 0,
      collectionRate: overview.totalFines > 0
        ? Math.round((overview.totalCollected / overview.totalFines) * 100)
        : 0,
      avgResolutionDays: Math.round(overview.averageResolutionTime / (1000 * 60 * 60 * 24))
    }
  }

  const keyMetrics = getKeyMetrics()

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Loading Analytics..." description="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole="admin"
      userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
      userEmail={user?.email || ""}
      notifications={0}
    >
      <DashboardContent
        title="Parking Violation Analytics"
        description="Comprehensive analytics and reporting for parking violations"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/parking/violations")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Violations
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </div>
                <div className="min-w-[150px]">
                  <label className="text-sm font-medium mb-2 block">Group By</label>
                  <Select value={groupBy} onValueChange={(value: "day" | "week" | "month") => setGroupBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          {keyMetrics && analyticsData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                      <p className="text-2xl font-bold">{keyMetrics.resolutionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                      <p className="text-2xl font-bold">{keyMetrics.collectionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                      <p className="text-2xl font-bold">{keyMetrics.avgResolutionDays} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Violations</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.totalViolations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="overview" className="mt-0">
                    {analyticsData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold">{analyticsData.overview.totalViolations}</div>
                            <div className="text-sm text-muted-foreground">Total Violations</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold">{analyticsData.overview.resolvedViolations}</div>
                            <div className="text-sm text-muted-foreground">Resolved</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold">${analyticsData.overview.totalCollected.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Collected Fines</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold">{analyticsData.overview.activeViolations}</div>
                            <div className="text-sm text-muted-foreground">Active Violations</div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="trends" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Trends Over Time</h3>
                      {analyticsData?.trends.monthly && analyticsData.trends.monthly.length > 0 ? (
                        <div className="grid gap-4">
                          {analyticsData.trends.monthly.map((trend, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{trend.month}</span>
                                  <div className="text-right">
                                    <div className="text-sm">Violations: {trend.violations}</div>
                                    <div className="text-sm">Fines: ${trend.fines.toLocaleString()}</div>
                                    <div className="text-sm">Collected: ${trend.collected.toLocaleString()}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No trend data available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="categories" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Violation Categories</h3>
                      {analyticsData?.distributions.byCategory && analyticsData.distributions.byCategory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analyticsData.distributions.byCategory.map((category, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{category.category}</span>
                                  <div className="text-right">
                                    <div className="text-lg font-bold">{category.violations}</div>
                                    <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">No category data available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-0">
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Performance analytics will be available soon</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-0">
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Financial analytics will be available soon</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Summary Insights */}
          {analyticsData && keyMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Total Activity</h4>
                    <p className="text-sm text-muted-foreground">
                      {analyticsData.overview.totalViolations} violations have been recorded with 
                      {analyticsData.overview.resolvedViolations} successfully resolved.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Resolution Efficiency</h4>
                    <p className="text-sm text-muted-foreground">
                      Average resolution time is {keyMetrics.avgResolutionDays} days, with {keyMetrics.resolutionRate}% 
                      of violations successfully resolved.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Financial Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      ${analyticsData.overview.totalCollected.toLocaleString()} collected out of 
                      ${analyticsData.overview.totalFines.toLocaleString()} total fines 
                      ({keyMetrics.collectionRate}% collection rate).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Current Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {analyticsData.overview.activeViolations} violations are currently active 
                      with ${analyticsData.overview.totalPending.toLocaleString()} in pending fines.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
