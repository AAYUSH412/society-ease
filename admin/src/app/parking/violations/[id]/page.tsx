"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ViolationDetailsModal } from "@/components/parking/violation-details-modal"
import { ViolationTimeline } from "@/components/parking/violation-timeline"
import { EvidenceGallery } from "@/components/parking/evidence-gallery"
import { ViolationActions } from "@/components/parking/violation-actions"
import { RelatedViolations } from "@/components/parking/related-violations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Car, Calendar, MapPin, User, AlertTriangle, FileText } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getViolationDetails, updateViolationStatus, addAdminNote, ParkingViolation } from "@/lib/api/parking/violations"
import { toast } from "sonner"

interface ViolationDetails {
  id: string
  type: string
  category: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "under_review" | "approved" | "rejected" | "resolved" | "dismissed"
  location: string
  coordinates?: { lat: number; lng: number }
  violatorInfo: {
    name: string
    unit: string
    phone: string
    email: string
    vehicleNumber: string
    vehicleType: string
    vehicleModel?: string
  }
  reportedBy: {
    name: string
    role: string
    contact: string
  }
  reportedAt: string
  description: string
  evidence: Array<{
    id: string
    type: "image" | "video"
    url: string
    thumbnail?: string
    timestamp: string
    description?: string
  }>
  fineAmount: number
  suggestedFine: number
  dueDate?: string
  paymentStatus?: "pending" | "paid" | "overdue" | "waived"
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  assignedTo?: string
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
  similarViolationsCount: number
  resolutionDeadline?: string
  lastActivity: string
}

export default function ViolationDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const violationId = params.id as string
  
  // State management
  const [violation, setViolation] = useState<ViolationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showTimelineModal, setShowTimelineModal] = useState(false)

  // Load violation details
  const loadViolationDetails = useCallback(async () => {
    if (!violationId) return
    
    try {
      setLoading(true)
      const response = await getViolationDetails(violationId)
      
      if (response.success && response.data) {
        // Map API response to component interface
        const apiViolation = response.data.violation
        const mappedViolation: ViolationDetails = {
          id: apiViolation._id,
          type: apiViolation.category.name,
          category: apiViolation.category.name,
          severity: apiViolation.category.severity,
          status: apiViolation.status,
          location: `${apiViolation.location.area}${apiViolation.location.specificLocation ? ` - ${apiViolation.location.specificLocation}` : ''}`,
          coordinates: apiViolation.location.coordinates ? {
            lat: apiViolation.location.coordinates.latitude,
            lng: apiViolation.location.coordinates.longitude
          } : undefined,
          violatorInfo: {
            name: apiViolation.violatedBy.ownerName || 'Unknown',
            unit: `${apiViolation.violatedBy.flatNumber}${apiViolation.violatedBy.building ? ` - ${apiViolation.violatedBy.building}` : ''}`,
            phone: '',
            email: '',
            vehicleNumber: apiViolation.violatedBy.vehicleNumber || '',
            vehicleType: '',
            vehicleModel: ''
          },
          reportedBy: {
            name: apiViolation.reportedBy.name,
            role: 'Resident',
            contact: ''
          },
          reportedAt: apiViolation.incidentDateTime,
          description: apiViolation.description,
          evidence: apiViolation.evidence.photos.map(photo => ({
            id: photo.photoId,
            type: 'image' as const,
            url: photo.url,
            thumbnail: photo.thumbnailUrl,
            timestamp: photo.uploadedAt,
            description: photo.description
          })),
          fineAmount: apiViolation.adminReview?.fineAmount || apiViolation.category.baseFineAmount,
          suggestedFine: apiViolation.category.baseFineAmount,
          dueDate: undefined,
          paymentStatus: undefined,
          reviewedBy: apiViolation.adminReview?.reviewedBy,
          reviewedAt: apiViolation.adminReview?.reviewedAt,
          reviewNotes: apiViolation.adminReview?.notes,
          assignedTo: undefined,
          priority: apiViolation.priority,
          tags: [],
          similarViolationsCount: response.data.relatedViolations.length,
          resolutionDeadline: undefined,
          lastActivity: apiViolation.updatedAt
        }
        setViolation(mappedViolation)
      } else {
        toast.error("Violation not found")
        router.push("/parking/violations")
      }
    } catch (error) {
      console.error("Error loading violation details:", error)
      toast.error("Failed to load violation details")
      router.push("/parking/violations")
    } finally {
      setLoading(false)
    }
  }, [violationId, router])

  useEffect(() => {
    loadViolationDetails()
  }, [loadViolationDetails])

  // Handle status update - matching ViolationActions interface
  const handleStatusUpdate = async (status: string, note?: string) => {
    if (!violation) return
    
    try {
      setActionLoading(true)
      const response = await updateViolationStatus(
        violation.id, 
        status as ParkingViolation['status'],
        note
      )
      
      if (response.success) {
        toast.success(`Violation ${status} successfully`)
        loadViolationDetails()
      } else {
        toast.error(response.message || "Failed to update violation")
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast.error("Failed to update violation status")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle add note
  const handleAddNote = async (note: string) => {
    if (!violation) return
    
    try {
      const response = await addAdminNote(violation.id, note)
      
      if (response.success) {
        toast.success("Note added successfully")
        loadViolationDetails()
      } else {
        toast.error("Failed to add note")
      }
    } catch (error) {
      console.error("Add note error:", error)
      toast.error("Failed to add note")
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "destructive"
      case "under_review": return "default"
      case "approved": return "default"
      case "resolved": return "default"
      case "rejected": return "secondary"
      case "dismissed": return "secondary"
      default: return "secondary"
    }
  }

  // Get severity color  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive"
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "secondary"
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Loading..." description="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  if (!violation) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Violation Not Found" description="">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Violation Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested violation could not be found.</p>
            <Button onClick={() => router.push("/parking/violations")}>
              Back to Violations
            </Button>
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
        title={`Violation #${violation.id.slice(-8).toUpperCase()}`}
        description={violation.type}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/parking/violations")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Full Details
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{violation.type}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getStatusColor(violation.status)}>
                        {violation.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge variant={getSeverityColor(violation.severity)}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {violation.category}
                      </Badge>
                      {violation.priority === "urgent" && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          URGENT
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-destructive">
                      ${violation.fineAmount}
                    </div>
                    {violation.suggestedFine !== violation.fineAmount && (
                      <div className="text-sm text-muted-foreground">
                        Suggested: ${violation.suggestedFine}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{violation.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(violation.reportedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Reported by {violation.reportedBy.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {violation.violatorInfo.vehicleNumber}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {violation.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceGallery violationId={violation.id} />
              </CardContent>
            </Card>

            {/* Timeline */}              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTimelineModal(true)}
                    className="w-full"
                  >
                    View Timeline
                  </Button>
                </CardContent>
              </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <ViolationActions
              violation={{
                id: violation.id,
                status: violation.status as "pending" | "under_review" | "approved" | "rejected" | "resolved" | "dismissed",
                assignedTo: violation.assignedTo
              }}
              onStatusUpdate={handleStatusUpdate}
              onAddNote={handleAddNote}
              onAssignReviewer={async (reviewerId: string) => {
                // TODO: Implement assign reviewer functionality
                console.log("Assign reviewer:", reviewerId)
              }}
              currentUser={{
                id: user?._id || "",
                name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin",
                role: "admin"
              }}
              isLoading={actionLoading}
            />

            {/* Violator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Violator Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Name</div>
                  <div className="text-sm text-muted-foreground">
                    {violation.violatorInfo.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Unit</div>
                  <div className="text-sm text-muted-foreground">
                    {violation.violatorInfo.unit}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Contact</div>
                  <div className="text-sm text-muted-foreground">
                    {violation.violatorInfo.phone}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {violation.violatorInfo.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Vehicle</div>
                  <div className="text-sm text-muted-foreground">
                    {violation.violatorInfo.vehicleNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {violation.violatorInfo.vehicleType}
                    {violation.violatorInfo.vehicleModel && ` - ${violation.violatorInfo.vehicleModel}`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            {violation.fineAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fine Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount</span>
                    <span className="text-lg font-bold">${violation.fineAmount}</span>
                  </div>
                  {violation.dueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Due Date</span>
                      <span className="text-sm">
                        {new Date(violation.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {violation.paymentStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={violation.paymentStatus === "paid" ? "default" : "destructive"}>
                        {violation.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Violations */}
            <RelatedViolations
              violatorInfo={violation.violatorInfo}
              currentViolationId={violation.id}
            />
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && (
          <ViolationDetailsModal
            violation={{
              id: violation.id,
              type: violation.type,
              severity: violation.severity as "low" | "medium" | "high",
              status: violation.status as "pending" | "under_review" | "resolved" | "dismissed",
              resident: {
                id: violation.violatorInfo.unit,
                name: violation.violatorInfo.name,
                flatNumber: violation.violatorInfo.unit,
                phoneNumber: violation.violatorInfo.phone,
                email: violation.violatorInfo.email
              },
              reporter: {
                name: violation.reportedBy.name,
                role: violation.reportedBy.role
              },
              location: violation.location,
              description: violation.description,
              evidencePhotos: violation.evidence.map(e => e.url),
              reportedAt: violation.reportedAt,
              reviewedAt: violation.reviewedAt,
              fine: violation.fineAmount > 0 ? {
                amount: violation.fineAmount,
                status: violation.paymentStatus as "pending" | "paid" | "waived" || "pending"
              } : undefined,
              notes: violation.reviewNotes
            }}
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
          />
        )}

        {/* Timeline Modal */}
        {showTimelineModal && (
          <ViolationTimeline
            violationId={violation.id}
            isOpen={showTimelineModal}
            onClose={() => setShowTimelineModal(false)}
          />
        )}
      </DashboardContent>
    </DashboardLayout>
  )
}
