"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViolationStatusBadge } from "@/components/shared/violation-status-badge"
import { SeverityIndicator } from "@/components/shared/severity-indicator"
import { ViolationTypeIcon } from "@/components/shared/violation-type-icon"
import { ResidentInfoCard } from "@/components/shared/resident-info-card"
import { ViolationTimeline } from "@/components/parking/violation-timeline"
import { EvidenceGallery } from "@/components/parking/evidence-gallery"
import {
  MapPin,
  Clock,
  User,
  FileText,
  DollarSign,
  AlertTriangle,
  Download,
  Share,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Violation {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  status: "pending" | "under_review" | "resolved" | "dismissed"
  resident: {
    id: string
    name: string
    flatNumber: string
    phoneNumber?: string
    email?: string
  }
  reporter: {
    name: string
    role: string
  }
  location: string
  description: string
  evidencePhotos: string[]
  reportedAt: string
  reviewedAt?: string
  resolvedAt?: string
  fine?: {
    amount: number
    status: "pending" | "paid" | "waived"
    issuedAt?: string
    paidAt?: string
  }
  notes?: string
  adminNotes?: string
  timeline?: Array<{
    id: string
    action: string
    timestamp: string
    user: string
    details?: string
  }>
}

interface ViolationDetailsModalProps {
  violation: Violation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViolationDetailsModal({
  violation,
  open,
  onOpenChange,
}: ViolationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (fromDate: string, toDate?: string) => {
    const start = new Date(fromDate)
    const end = toDate ? new Date(toDate) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`
    }
    return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "dismissed":
        return <XCircle className="h-5 w-5 text-gray-500" />
      case "under_review":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
    }
  }

  const handleExportReport = () => {
    // Implementation for exporting violation report
    console.log("Exporting violation report for:", violation.id)
  }

  const handleShareViolation = () => {
    // Implementation for sharing violation details
    console.log("Sharing violation:", violation.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ViolationTypeIcon type={violation.type} className="h-8 w-8" />
              <div>
                <DialogTitle className="text-xl">
                  {violation.type.replace("_", " ")} Violation
                </DialogTitle>
                <DialogDescription>
                  Violation ID: {violation.id}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ViolationStatusBadge status={violation.status} />
              <SeverityIndicator severity={violation.severity} />
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="fine">Fine</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="details" className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Resident Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResidentInfoCard 
                      resident={{
                        ...violation.resident,
                        userId: violation.resident.id,
                        phone: violation.resident.phoneNumber,
                      }} 
                      showVehicleInfo={true}
                      showContactInfo={true}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Violation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(violation.status)}
                        <ViolationStatusBadge status={violation.status} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Severity</span>
                      <SeverityIndicator severity={violation.severity} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Type</span>
                      <span className="text-sm">{violation.type.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Location</span>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {violation.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {violation.description}
                  </p>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Timeline Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium mb-1">Reported At</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(violation.reportedAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {violation.reporter.name} ({violation.reporter.role})
                      </div>
                    </div>
                    {violation.reviewedAt && (
                      <div>
                        <div className="text-sm font-medium mb-1">Reviewed At</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(violation.reviewedAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Processing time: {formatDuration(violation.reportedAt, violation.reviewedAt)}
                        </div>
                      </div>
                    )}
                    {violation.resolvedAt && (
                      <div>
                        <div className="text-sm font-medium mb-1">Resolved At</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(violation.resolvedAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total resolution time: {formatDuration(violation.reportedAt, violation.resolvedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {(violation.notes || violation.adminNotes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {violation.notes && (
                      <div>
                        <div className="text-sm font-medium mb-2">Reporter Notes</div>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {violation.notes}
                        </p>
                      </div>
                    )}
                    {violation.adminNotes && (
                      <div>
                        <div className="text-sm font-medium mb-2">Admin Notes</div>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {violation.adminNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <EvidenceGallery violationId={violation.id} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <ViolationTimeline 
                violationId={violation.id}
                isOpen={true}
                onClose={() => {}}
              />
            </TabsContent>

            <TabsContent value="fine" className="space-y-4">
              {violation.fine ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Fine Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium mb-1">Amount</div>
                        <div className="text-2xl font-bold">₹{violation.fine.amount}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Status</div>
                        <Badge
                          variant="outline"
                          className={
                            violation.fine.status === "paid"
                              ? "text-green-600 border-green-200"
                              : violation.fine.status === "waived"
                              ? "text-blue-600 border-blue-200"
                              : "text-orange-600 border-orange-200"
                          }
                        >
                          {violation.fine.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      {violation.fine.issuedAt && (
                        <div className="flex justify-between text-sm">
                          <span>Issued At:</span>
                          <span className="text-muted-foreground">
                            {formatDate(violation.fine.issuedAt)}
                          </span>
                        </div>
                      )}
                      {violation.fine.paidAt && (
                        <div className="flex justify-between text-sm">
                          <span>Paid At:</span>
                          <span className="text-muted-foreground">
                            {formatDate(violation.fine.paidAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No fine issued for this violation</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareViolation}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Violation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
