"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ViolationDetailsModal } from "./violation-details-modal"
import { 
  MapPin, 
  Car, 
  AlertTriangle, 
  User,
  Clock,
  Eye,
  ChevronRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RelatedViolation {
  id: string
  type: string
  category: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "under_review" | "approved" | "rejected" | "resolved" | "dismissed"
  location: string
  violatorInfo: {
    name: string
    unit: string
    vehicleNumber: string
    vehicleType: string
  }
  reportedAt: string
  reportedBy: {
    name: string
    role: string
  }
  evidence: Array<{
    type: "image" | "video"
    url: string
    thumbnail?: string
  }>
}

interface RelatedViolationsProps {
  currentViolationId: string
  violatorInfo: {
    name: string
    unit: string
    vehicleNumber: string
  }
  onViolationSelect?: (violationId: string) => void
}

export function RelatedViolations({
  currentViolationId,
  violatorInfo,
  onViolationSelect
}: RelatedViolationsProps) {
  const [violations, setViolations] = useState<RelatedViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedViolation, setSelectedViolation] = useState<RelatedViolation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchRelatedViolations = useCallback(async () => {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockViolations: RelatedViolation[] = [
        {
          id: "v-001",
          type: "Illegal Parking",
          category: "Parking Violation",
          severity: "medium",
          status: "resolved",
          location: "Building A - Level 2",
          violatorInfo: {
            name: violatorInfo.name,
            unit: violatorInfo.unit,
            vehicleNumber: violatorInfo.vehicleNumber,
            vehicleType: "Car"
          },
          reportedAt: "2024-01-15T10:30:00Z",
          reportedBy: {
            name: "Security Guard",
            role: "Security"
          },
          evidence: [
            {
              type: "image",
              url: "/api/evidence/img-001.jpg",
              thumbnail: "/api/evidence/thumb-001.jpg"
            }
          ]
        },
        {
          id: "v-002",
          type: "Overtime Parking",
          category: "Parking Violation",
          severity: "low",
          status: "approved",
          location: "Building B - Visitor Parking",
          violatorInfo: {
            name: violatorInfo.name,
            unit: violatorInfo.unit,  
            vehicleNumber: violatorInfo.vehicleNumber,
            vehicleType: "Car"
          },
          reportedAt: "2024-01-20T14:45:00Z",
          reportedBy: {
            name: "Resident Manager",
            role: "Management"
          },
          evidence: [
            {
              type: "image", 
              url: "/api/evidence/img-002.jpg",
              thumbnail: "/api/evidence/thumb-002.jpg"
            }
          ]
        }
      ]
      
      // Filter out current violation
      const filtered = mockViolations.filter(v => v.id !== currentViolationId)
      setViolations(filtered)
    } catch (error) {
      console.error("Failed to fetch related violations:", error)
    } finally {
      setLoading(false)
    }
  }, [currentViolationId, violatorInfo])

  useEffect(() => {
    fetchRelatedViolations()
  }, [fetchRelatedViolations])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "under_review": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "resolved": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "dismissed": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleViewDetails = (violation: RelatedViolation) => {
    setSelectedViolation(violation)
    setModalOpen(true)
  }

  const handleViolationClick = (violationId: string) => {
    if (onViolationSelect) {
      onViolationSelect(violationId)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          <CardTitle className="flex items-center justify-between">
            <span>Related Violations</span>
            <Badge variant="secondary">{violations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No related violations found for this violator.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((violation) => (
                <div 
                  key={violation.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => handleViolationClick(violation.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{violation.type}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(violation.severity)} variant="secondary">
                          {violation.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(violation.status)} variant="secondary">
                          {violation.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDetails(violation)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{violation.location}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      <span>{violation.violatorInfo.vehicleNumber}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatDistanceToNow(new Date(violation.reportedAt), { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Reported by {violation.reportedBy.name}</span>
                    </div>
                  </div>

                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={`/api/avatar/${violation.reportedBy.name}`} />
                        <AvatarFallback>
                          {violation.reportedBy.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {violation.reportedBy.role}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{violation.evidence.length} evidence</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violation Details Modal */}
      {selectedViolation && (
        <ViolationDetailsModal
          violation={{
            id: selectedViolation.id,
            type: selectedViolation.type,
            severity: selectedViolation.severity === "critical" ? "high" : selectedViolation.severity as "low" | "medium" | "high",
            status: selectedViolation.status === "approved" || selectedViolation.status === "rejected" ? "resolved" : selectedViolation.status as "pending" | "under_review" | "resolved" | "dismissed",
            resident: {
              id: selectedViolation.id,
              name: selectedViolation.violatorInfo.name,
              flatNumber: selectedViolation.violatorInfo.unit,
              phoneNumber: "",
              email: ""
            },
            reporter: {
              name: selectedViolation.reportedBy.name,
              role: selectedViolation.reportedBy.role
            },
            location: selectedViolation.location,
            description: `${selectedViolation.type} violation at ${selectedViolation.location}`,
            evidencePhotos: selectedViolation.evidence.map(e => e.url),
            reportedAt: selectedViolation.reportedAt,
            notes: ""
          }}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  )
}
