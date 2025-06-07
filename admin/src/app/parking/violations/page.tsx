"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ViolationsTable } from "@/components/parking/violations-table"
import { ViolationFilters } from "@/components/parking/violation-filters"
import { BulkActionsToolbar } from "@/components/parking/bulk-actions-toolbar"
import { ViolationStatsCards } from "@/components/parking/violation-stats-cards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Filter, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getAllViolations, exportViolations, bulkReviewViolations } from "@/lib/api/parking/violations"
import { toast } from "sonner"

interface ViolationOverview {
  totalViolations: number
  pendingReview: number
  resolvedToday: number
  totalFines: number
  averageResolutionTime: number
  mostCommonViolation: string
  activeViolators: number
  monthlyTrend: number
}

export default function ViolationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State management
  const [overview, setOverview] = useState<ViolationOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedViolations, setSelectedViolations] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    severity: "",
    dateRange: {from: undefined, to: undefined} as {from?: string, to?: string},
  })
  const [activeTab, setActiveTab] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  // Load overview data
  const loadOverviewData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAllViolations({ page: 1, limit: 1 })
      
      if (response.success) {
        // Extract stats from the response
        const stats = response.data.stats
        setOverview({
          totalViolations: stats.total,
          pendingReview: stats.pending + stats.underReview,
          resolvedToday: stats.todayReported,
          totalFines: 0, // This would need to come from fines API
          averageResolutionTime: stats.averageResolutionTime,
          mostCommonViolation: "Unauthorized Parking", // Mock data
          activeViolators: 0, // Mock data
          monthlyTrend: 15 // Mock data
        })
      }
    } catch (error) {
      console.error("Error loading overview data:", error)
      toast.error("Failed to load violation statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOverviewData()
  }, [loadOverviewData])

  // Handle bulk actions
  const handleBulkAction = async (action: string, violationIds: string[]) => {
    try {
      let bulkAction: 'approve' | 'reject' | 'dismiss'
      
      switch (action) {
        case "approve":
          bulkAction = "approve"
          break
        case "reject":
          bulkAction = "reject"
          break
        case "dismiss":
          bulkAction = "dismiss"
          break
        default:
          toast.error("Invalid action selected")
          return
      }

      const response = await bulkReviewViolations({
        violationIds,
        action: bulkAction,
        notes: `Bulk ${action} action performed`
      })
      
      if (response.success) {
        toast.success(`Successfully ${action}d ${response.data.successful} violation(s)`)
        setSelectedViolations([])
        loadOverviewData()
      } else {
        toast.error("Failed to update violations")
      }
    } catch (error) {
      console.error("Bulk action error:", error)
      toast.error("Failed to perform bulk action")
    }
  }

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      setIsExporting(true)
      const blob = await exportViolations({ 
        format,
        status: filters.status || undefined,
        category: filters.type || undefined,
        severity: filters.severity || undefined,
        dateFrom: filters.dateRange?.from,
        dateTo: filters.dateRange?.to
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `violations-report-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Report exported successfully`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export violations report")
    } finally {
      setIsExporting(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Update filters based on tab
    const statusMap: Record<string, string> = {
      "all": "",
      "pending": "pending",
      "under_review": "under_review", 
      "resolved": "resolved",
      "dismissed": "dismissed"
    }
    
    setFilters(prev => ({
      ...prev,
      status: statusMap[tab] || ""
    }))
  }

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Parking Violations" description="Loading...">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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
        title="Parking Violations"
        description="Manage and track all parking violations"
        actions={
          <div className="flex gap-2">
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
            <Button onClick={() => router.push('/parking/violations/analytics')}>
              <Filter className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Overview Stats */}
          <ViolationStatsCards overview={overview} />

          {/* Bulk Actions Toolbar */}
          {selectedViolations.length > 0 && (
            <BulkActionsToolbar
              selectedCount={selectedViolations.length}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedViolations([])}
            />
          )}

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Violations</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {overview?.totalViolations || 0} Total
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadOverviewData}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    {overview?.pendingReview ? (
                      <Badge variant="destructive" className="ml-2">
                        {overview.pendingReview}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="under_review">Under Review</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Filters */}
                  <ViolationFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />

                  {/* Violations Table */}
                  <div className="mt-6">
                    <TabsContent value={activeTab} className="mt-0">
                      <ViolationsTable
                        filters={filters}
                        selectedViolations={selectedViolations}
                        onSelectionChange={setSelectedViolations}
                      />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
