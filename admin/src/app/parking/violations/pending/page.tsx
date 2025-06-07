"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ViolationReviewCard } from "@/components/parking/violation-review-card"
import { ReviewFilters } from "@/components/parking/review-filters"
import { ReviewBulkActions } from "@/components/parking/review-bulk-actions"
import { ReviewStats } from "@/components/parking/review-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, RefreshCw, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getPendingViolations, updateViolationStatus, assignViolationReviewer, ParkingViolation } from "@/lib/api/parking/violations"
import { toast } from "sonner"

// Use ParkingViolation from API instead of custom interface
type PendingViolation = ParkingViolation

interface ReviewStatsData {
  totalPending: number
  approvedToday: number
  rejectedToday: number
  averageReviewTime: number
  pendingByPriority: {
    critical: number
    high: number
    medium: number
    low: number
  }
  reviewerWorkload: Array<{
    id: string
    name: string
    assigned: number
    completed: number
  }>
  urgentCount: number
  overdueCount: number
}

export default function PendingViolationsPage() {
  const { user } = useAuth()
  
  // State management
  const [violations, setViolations] = useState<PendingViolation[]>([])
  const [stats, setStats] = useState<ReviewStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedViolations, setSelectedViolations] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: "",
    severity: "",
    priority: "",
    reporter: "",
    dateRange: undefined as { from?: Date; to?: Date } | undefined,
    vehicleType: "",
  })
  const [activeTab, setActiveTab] = useState("all")
  const [reviewMode, setReviewMode] = useState<"individual" | "bulk">("individual")

  // Load pending violations
  const loadPendingViolations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getPendingViolations({
        status: "pending",
        ...filters,
        dateFrom: filters.dateRange?.from?.toISOString(),
        dateTo: filters.dateRange?.to?.toISOString(),
      })
      
      if (response.success && response.data) {
        setViolations(response.data.violations || [])
        // Create mock stats since API doesn't provide them
        const mockStats: ReviewStatsData = {
          totalPending: response.data.violations.length,
          approvedToday: 0,
          rejectedToday: 0,
          averageReviewTime: 24,
          pendingByPriority: {
            critical: response.data.violations.filter(v => v.priority === 'urgent').length,
            high: response.data.violations.filter(v => v.priority === 'high').length,
            medium: response.data.violations.filter(v => v.priority === 'medium').length,
            low: response.data.violations.filter(v => v.priority === 'low').length,
          },
          reviewerWorkload: [],
          urgentCount: response.data.violations.filter(v => v.priority === 'urgent').length,
          overdueCount: 0,
        }
        setStats(mockStats)
      }
    } catch (error) {
      console.error("Error loading pending violations:", error)
      toast.error("Failed to load pending violations")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadPendingViolations()
  }, [loadPendingViolations])

  // Handle violation review
  const handleViolationReview = async (
    violationId: string,
    decision: "approve" | "reject" | "request_more_info",
    data: {
      fineAmount?: number
      reason?: string
      additionalNotes?: string
    }
  ) => {
    try {
      const status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "pending"
      const response = await updateViolationStatus(violationId, status, data.reason)
      
      if (response.success) {
        toast.success(`Violation ${decision}d successfully`)
        loadPendingViolations()
      } else {
        toast.error(response.message || "Failed to update violation")
      }
    } catch (error) {
      console.error("Review error:", error)
      toast.error("Failed to review violation")
    }
  }

  // Handle bulk review
  const handleBulkReview = async (
    violationIds: string[],
    decision: "approve" | "reject",
    data: {
      fineAmount?: number
      reason: string
    }
  ) => {
    try {
      const status = decision === "approve" ? "approved" : "rejected"
      const promises = violationIds.map(id =>
        updateViolationStatus(id, status, data.reason)
      )

      const results = await Promise.all(promises)
      const successful = results.filter(r => r.success).length
      
      if (successful === violationIds.length) {
        toast.success(`Successfully ${decision}d ${successful} violation(s)`)
      } else {
        toast.warning(`${decision}d ${successful} of ${violationIds.length} violation(s)`)
      }
      
      setSelectedViolations([])
      loadPendingViolations()
    } catch (error) {
      console.error("Bulk review error:", error)
      toast.error("Failed to perform bulk review")
    }
  }

  // Handle violation assignment
  const handleAssignViolation = async (violationId: string, reviewerId: string) => {
    try {
      const response = await assignViolationReviewer(violationId, reviewerId)
      
      if (response.success) {
        toast.success("Violation assigned successfully")
        loadPendingViolations()
      } else {
        toast.error(response.message || "Failed to assign violation")
      }
    } catch (error) {
      console.error("Assignment error:", error)
      toast.error("Failed to assign violation")
    }
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // Get filtered violations based on tab
  const getFilteredViolations = () => {
    switch (activeTab) {
      case "assigned":
        return violations.filter(v => v.adminReview?.reviewedBy === user?._id)
      case "high_priority":
        return violations.filter(v => v.priority === "high" || v.priority === "urgent")
      case "overdue":
        // Since reviewDeadline doesn't exist, use createdAt + 48 hours as deadline
        return violations.filter(v => {
          const deadline = new Date(v.createdAt)
          deadline.setHours(deadline.getHours() + 48)
          return deadline < new Date()
        })
      default:
        return violations
    }
  }

  const filteredViolations = getFilteredViolations()

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Pending Reviews" description="Loading...">
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
      notifications={stats?.overdueCount || 0}
    >
      <DashboardContent
        title="Pending Reviews"
        description="Review and approve pending parking violations"
        actions={
          <div className="flex gap-2">
            <Button
              variant={reviewMode === "individual" ? "default" : "outline"}
              onClick={() => setReviewMode("individual")}
            >
              Individual Review
            </Button>
            <Button
              variant={reviewMode === "bulk" ? "default" : "outline"}
              onClick={() => setReviewMode("bulk")}
            >
              Bulk Review
            </Button>
            <Button
              variant="outline"
              onClick={loadPendingViolations}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Review Stats */}
          <ReviewStats stats={stats} />

          {/* Bulk Actions */}
          {reviewMode === "bulk" && selectedViolations.length > 0 && (
            <ReviewBulkActions
              selectedViolations={selectedViolations}
              onBulkApprove={async (violationIds: string[], reason?: string) => {
                await handleBulkReview(violationIds, "approve", { reason: reason || "Approved" })
              }}
              onBulkReject={async (violationIds: string[], reason: string) => {
                await handleBulkReview(violationIds, "reject", { reason })
              }}
              onBulkAssign={async (violationIds: string[], reviewerId: string) => {
                // Handle bulk assignment
                for (const id of violationIds) {
                  await handleAssignViolation(id, reviewerId)
                }
              }}
              onClearSelection={() => setSelectedViolations([])}
              reviewers={[]} // Empty for now
            />
          )}

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Violations</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {filteredViolations.length} Violations
                  </Badge>
                  {stats?.overdueCount && stats.overdueCount > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {stats.overdueCount} Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    All
                    <Badge variant="secondary" className="ml-2">
                      {violations.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="assigned">
                    <User className="h-4 w-4 mr-1" />
                    Assigned to Me
                    <Badge variant="secondary" className="ml-2">
                      {violations.filter(v => v.adminReview?.reviewedBy === user?._id).length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="high_priority">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    High Priority
                    <Badge variant="destructive" className="ml-2">
                      {(stats?.pendingByPriority.critical || 0) + (stats?.pendingByPriority.high || 0)}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="overdue">
                    <Clock className="h-4 w-4 mr-1" />
                    Overdue
                    <Badge variant="destructive" className="ml-2">
                      {stats?.overdueCount || 0}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Filters */}
                  <ReviewFilters
                    filters={{
                      ...filters,
                      dateRange: filters.dateRange ? {
                        from: filters.dateRange.from,
                        to: filters.dateRange.to
                      } : undefined
                    }}
                    onFiltersChange={setFilters}
                    onReset={() => setFilters({
                      search: "",
                      severity: "",
                      priority: "",
                      reporter: "",
                      dateRange: undefined,
                      vehicleType: "",
                    })}
                    violationCategories={[]}
                    reporterTypes={[]}
                  />

                  {/* Violations Grid */}
                  <div className="mt-6">
                    <TabsContent value={activeTab} className="mt-0">
                      {filteredViolations.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No pending violations</h3>
                          <p className="text-muted-foreground">All violations in this category have been reviewed.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {filteredViolations.map((violation) => (
                            <ViolationReviewCard
                              key={violation._id}
                              violation={{
                                _id: violation._id,
                                violationId: violation.violationId,
                                category: violation.category.name,
                                description: violation.description,
                                severity: violation.category.severity,
                                status: violation.status,
                                incidentDateTime: violation.incidentDateTime,
                                location: `${violation.location.area}${violation.location.specificLocation ? ` - ${violation.location.specificLocation}` : ''}`,
                                vehicleInfo: {
                                  licensePlate: violation.violatedBy.vehicleNumber || '',
                                  make: '',
                                  model: '',
                                  color: ''
                                },
                                resident: {
                                  name: violation.violatedBy.ownerName || 'Unknown',
                                  flatNumber: violation.violatedBy.flatNumber,
                                  building: violation.violatedBy.building,
                                  email: '',
                                  phone: ''
                                },
                                reporter: {
                                  name: violation.reportedBy.name,
                                  type: 'resident' as const
                                },
                                evidence: violation.evidence.photos.map(photo => ({
                                  type: 'image' as const,
                                  url: photo.url,
                                  thumbnail: photo.thumbnailUrl
                                })),
                                estimatedFine: violation.category.baseFineAmount,
                                priority: violation.priority
                              }}
                              reviewMode={reviewMode}
                              isSelected={selectedViolations.includes(violation._id)}
                              onSelect={(selected) => {
                                if (selected) {
                                  setSelectedViolations(prev => [...prev, violation._id])
                                } else {
                                  setSelectedViolations(prev => prev.filter(id => id !== violation._id))
                                }
                              }}
                              onReview={(violationId: string, decision: "approve" | "reject" | "request_more_info", data: any) => 
                                handleViolationReview(violationId, decision, data)
                              }
                              onAssign={(violationId: string, reviewerId: string) => 
                                handleAssignViolation(violationId, reviewerId)
                              }
                            />
                          ))}
                        </div>
                      )}
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
