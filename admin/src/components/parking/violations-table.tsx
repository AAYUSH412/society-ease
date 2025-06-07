"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViolationStatusBadge } from "@/components/shared/violation-status-badge"
import { SeverityIndicator } from "@/components/shared/severity-indicator"
import { ViolationTypeIcon } from "@/components/shared/violation-type-icon"
import { ResidentInfoCard } from "@/components/shared/resident-info-card"
import { ViolationDetailsModal } from "./violation-details-modal"
import { ViolationReviewDialog } from "./violation-review-dialog"
// Import the ParkingViolation type from API
import * as violationApi from "@/lib/api/parking/violations"
import type { ParkingViolation } from "@/lib/api/parking/violations"

// Transform ParkingViolation to the format expected by modal components
const transformViolationForModal = (violation: ParkingViolation) => {
  // Map status values
  const mapStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'resolved'
      case 'rejected':
        return 'dismissed'
      default:
        return status as 'pending' | 'under_review' | 'resolved' | 'dismissed'
    }
  }

  return {
    id: violation._id,
    type: violation.category.name,
    severity: violation.category.severity === 'critical' ? 'high' : violation.category.severity as 'low' | 'medium' | 'high',
    status: mapStatus(violation.status),
    resident: {
      id: violation.violatedBy.flatNumber,
      name: violation.violatedBy.ownerName || `Resident ${violation.violatedBy.flatNumber}`,
      flatNumber: violation.violatedBy.flatNumber,
      phoneNumber: '', // Not available in ParkingViolation
      email: '', // Not available in ParkingViolation
    },
    reporter: {
      name: violation.reportedBy.name,
      role: 'Admin', // Default role since not available in ParkingViolation
    },
    location: `${violation.location.area}${violation.location.specificLocation ? ` - ${violation.location.specificLocation}` : ''}`,
    description: violation.description,
    evidencePhotos: violation.evidence.photos.map(photo => photo.url),
    reportedAt: violation.createdAt,
    reviewedAt: violation.adminReview ? violation.updatedAt : undefined,
    resolvedAt: violation.status === 'resolved' ? violation.updatedAt : undefined,
    fine: violation.adminReview?.fineIssued ? {
      amount: violation.adminReview.fineAmount || violation.category.baseFineAmount,
      status: 'pending' as const,
      issuedAt: violation.updatedAt,
    } : undefined,
    notes: violation.adminReview?.notes || '',
    timeline: [],
    details: violation.adminReview?.notes || '',
  }
}
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  MapPin,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

// Remove local interface - using ParkingViolation from API

interface ViolationsTableProps {
  filters: {
    status: string
    type: string
    severity: string
    dateRange: {
      from?: string
      to?: string
    }
  }
  selectedViolations: string[]
  onSelectionChange: (selected: string[]) => void
}

export function ViolationsTable({
  filters,
  selectedViolations,
  onSelectionChange,
}: ViolationsTableProps) {
  const [violations, setViolations] = useState<ParkingViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedViolation, setSelectedViolation] = useState<ParkingViolation | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const loadViolations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await violationApi.getAllViolations({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        category: filters.type || undefined,
        severity: filters.severity || undefined,
        dateFrom: filters.dateRange?.from,
        dateTo: filters.dateRange?.to,
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      setViolations(response.data.violations)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalViolations,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error("Failed to load violations:", error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    loadViolations()
  }, [loadViolations])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(violations.map(v => v._id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectViolation = (violationId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedViolations, violationId])
    } else {
      onSelectionChange(selectedViolations.filter(id => id !== violationId))
    }
  }

  const handleViewDetails = (violation: ParkingViolation) => {
    setSelectedViolation(violation)
    setShowDetailsModal(true)
  }

  const handleReviewViolation = (violation: ParkingViolation) => {
    setSelectedViolation(violation)
    setShowReviewDialog(true)
  }

  const handleDeleteViolation = async (violationId: string) => {
    try {
      await violationApi.deleteViolation(violationId)
      await loadViolations()
      onSelectionChange(selectedViolations.filter(id => id !== violationId))
    } catch (error) {
      console.error("Failed to delete violation:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading violations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded animate-pulse">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Violations ({pagination.total})</CardTitle>
              <CardDescription>
                Manage parking violations and track their resolution
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} violations
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          violations.length > 0 &&
                          violations.every(v => selectedViolations.includes(v._id))
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Violation</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation._id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedViolations.includes(violation._id)}
                          onCheckedChange={(checked) =>
                            handleSelectViolation(violation._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <ViolationTypeIcon type={violation.category.name} className="h-6 w-6" />
                          <div>
                            <div className="font-medium">{violation.category.name.replace("_", " ")}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Camera className="h-3 w-3 mr-1" />
                              {violation.evidence.photos.length} photo(s)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ResidentInfoCard 
                          resident={{
                            userId: violation.violatedBy.flatNumber, // Using flatNumber as a fallback for userId
                            flatNumber: violation.violatedBy.flatNumber,
                            building: violation.violatedBy.building,
                            name: violation.violatedBy.ownerName || `Resident ${violation.violatedBy.flatNumber}`,
                            vehicleNumber: violation.violatedBy.vehicleNumber
                          }} 
                          compact 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {violation.location.area}
                          {violation.location.specificLocation && ` - ${violation.location.specificLocation}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ViolationStatusBadge status={violation.status} />
                      </TableCell>
                      <TableCell>
                        <SeverityIndicator severity={violation.category.severity} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(violation.createdAt)}</div>
                          <div className="text-muted-foreground">
                            by {violation.reportedBy.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {violation.adminReview?.fineIssued ? (
                          <div className="text-sm">
                            <div className="font-medium">₹{violation.adminReview.fineAmount || violation.category.baseFineAmount}</div>
                            <Badge
                              variant="outline"
                              className="text-xs text-orange-600"
                            >
                              issued
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(violation)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReviewViolation(violation)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Review/Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteViolation(violation._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedViolation && (
        <>
          <ViolationDetailsModal
            violation={transformViolationForModal(selectedViolation)}
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
          />
          
          <ViolationReviewDialog
            violation={transformViolationForModal(selectedViolation)}
            open={showReviewDialog}
            onOpenChange={setShowReviewDialog}
            onViolationUpdated={() => {
              loadViolations()
              setShowReviewDialog(false)
            }}
          />
        </>
      )}
    </>
  )
}
