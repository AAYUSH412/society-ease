"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ViolationStatusBadge } from "@/components/shared/violation-status-badge"
import { SeverityIndicator } from "@/components/shared/severity-indicator"
import { PhotoViewer } from "@/components/shared/photo-viewer"
import * as violationApi from "@/lib/api/parking/violations"
import {
  Clock,
  User,
  MessageSquare,
  Camera,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Eye,
  Download,
  Car,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface TimelineEvent {
  _id: string
  type: 'created' | 'updated' | 'reviewed' | 'fine_issued' | 'fine_paid' | 'fine_waived' | 'resolved' | 'rejected' | 'comment_added' | 'evidence_added'
  timestamp: string
  user: {
    _id: string
    name: string
    role: string
    avatar?: string
  }
  details: {
    previousStatus?: string
    newStatus?: string
    amount?: number
    reason?: string
    comment?: string
    evidence?: string[]
    [key: string]: string | number | string[] | undefined
  }
  metadata?: {
    ip?: string
    userAgent?: string
    location?: string
  }
}

interface ViolationDetails {
  _id: string
  violationType: string
  description: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'dismissed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  reportedBy: {
    _id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  resident: {
    _id: string
    name: string
    email: string
    phone?: string
    unitNumber: string
    avatar?: string
  }
  vehicleInfo: {
    plateNumber: string
    make?: string
    model?: string
    color?: string
  }
  evidencePhotos: string[]
  createdAt: string
  updatedAt: string
  timeline: TimelineEvent[]
}

interface ViolationTimelineProps {
  violationId: string
  isOpen: boolean
  onClose: () => void
}

export function ViolationTimeline({ violationId, isOpen, onClose }: ViolationTimelineProps) {
  const [violation, setViolation] = useState<ViolationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const loadViolationDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await violationApi.getViolationDetails(violationId)
      // Extract violation data from API response
      if (response.data?.violation) {
        setViolation(response.data.violation as unknown as ViolationDetails)
      }
    } catch (error) {
      console.error('Error loading violation details:', error)
      toast.error('Failed to load violation timeline')
    } finally {
      setLoading(false)
    }
  }, [violationId])

  useEffect(() => {
    if (isOpen && violationId) {
      loadViolationDetails()
    }
  }, [isOpen, violationId, loadViolationDetails])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'fine_issued':
        return <DollarSign className="h-4 w-4 text-orange-500" />
      case 'fine_paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fine_waived':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'evidence_added':
        return <Camera className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTitle = (event: TimelineEvent) => {
    switch (event.type) {
      case 'created':
        return 'Violation Reported'
      case 'reviewed':
        return 'Violation Reviewed'
      case 'fine_issued':
        return 'Fine Issued'
      case 'fine_paid':
        return 'Fine Paid'
      case 'fine_waived':
        return 'Fine Waived'
      case 'resolved':
        return 'Violation Resolved'
      case 'rejected':
        return 'Violation Rejected'
      case 'comment_added':
        return 'Comment Added'
      case 'evidence_added':
        return 'Evidence Added'
      default:
        return 'Status Updated'
    }
  }

  const getEventDescription = (event: TimelineEvent) => {
    const { details } = event
    switch (event.type) {
      case 'created':
        return `Initial violation report submitted for vehicle ${violation?.vehicleInfo.plateNumber}`
      case 'reviewed':
        return `Status changed from ${details.previousStatus} to ${details.newStatus}`
      case 'fine_issued':
        return `Fine of $${details.amount} issued${details.reason ? ` - ${details.reason}` : ''}`
      case 'fine_paid':
        return `Fine payment of $${details.amount} received`
      case 'fine_waived':
        return `Fine waived${details.reason ? ` - ${details.reason}` : ''}`
      case 'resolved':
        return `Violation marked as resolved${details.reason ? ` - ${details.reason}` : ''}`
      case 'rejected':
        return `Violation rejected${details.reason ? ` - ${details.reason}` : ''}`
      case 'comment_added':
        return details.comment || 'Comment added to violation'
      case 'evidence_added':
        return `${details.evidence?.length || 1} evidence photo(s) added`
      default:
        return 'Violation updated'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const downloadEvidence = async (photoUrl: string, index: number) => {
    try {
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `violation-evidence-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      toast.success('Evidence photo downloaded')
    } catch (error) {
      console.error('Error downloading evidence:', error)
      toast.error('Failed to download evidence')
    }
  }

  if (!violation && !loading) {
    return null
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Violation Timeline</span>
            </DialogTitle>
            <DialogDescription>
              Complete history and timeline of violation #{violationId?.slice(-8)}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading timeline...</span>
            </div>
          ) : violation ? (
            <div className="space-y-6">
              {/* Violation Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-lg">{violation.violationType}</CardTitle>
                        <CardDescription>{violation.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <SeverityIndicator severity={violation.severity} />
                      <ViolationStatusBadge status={violation.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vehicle Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>Vehicle Information</span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Plate:</span> {violation.vehicleInfo.plateNumber}</p>
                        {violation.vehicleInfo.make && (
                          <p><span className="font-medium">Make/Model:</span> {violation.vehicleInfo.make} {violation.vehicleInfo.model}</p>
                        )}
                        {violation.vehicleInfo.color && (
                          <p><span className="font-medium">Color:</span> {violation.vehicleInfo.color}</p>
                        )}
                      </div>
                    </div>

                    {/* Location & Date */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location & Time</span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Location:</span> {violation.location}</p>
                        <p><span className="font-medium">Reported:</span> {new Date(violation.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Resident Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Resident</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={violation.resident.avatar} />
                          <AvatarFallback>{violation.resident.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{violation.resident.name}</p>
                          <p className="text-muted-foreground">Unit {violation.resident.unitNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Reported By</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={violation.reportedBy.avatar} />
                          <AvatarFallback>{violation.reportedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{violation.reportedBy.name}</p>
                          <p className="text-muted-foreground">{violation.reportedBy.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Photos */}
              {violation.evidencePhotos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Camera className="h-5 w-5" />
                      <span>Evidence Photos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {violation.evidencePhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={photo}
                            alt={`Evidence ${index + 1}`}
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(photo)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setSelectedImage(photo)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => downloadEvidence(photo, index)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Activity Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {violation.timeline.map((event, index) => {
                      const timestamp = formatTimestamp(event.timestamp)
                      return (
                        <div key={event._id} className="flex space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                              {getEventIcon(event.type)}
                            </div>
                            {index < violation.timeline.length - 1 && (
                              <div className="w-px h-12 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{getEventTitle(event)}</h4>
                              <div className="text-xs text-muted-foreground text-right">
                                <p>{timestamp.date}</p>
                                <p>{timestamp.time}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {getEventDescription(event)}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={event.user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {event.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{event.user.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.user.role}
                              </Badge>
                            </div>
                            {event.details.comment && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <MessageSquare className="h-3 w-3 inline mr-1" />
                                {event.details.comment}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Failed to load violation details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer */}
      {selectedImage && (
        <PhotoViewer
          photos={[{
            photoId: 'evidence-photo',
            url: selectedImage,
            uploadedAt: new Date().toISOString()
          }]}
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        />
      )}
    </>
  )
}
