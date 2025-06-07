"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Car, 
  Calendar,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"

export interface ViolationReviewCardProps {
  violation: {
    _id: string
    violationId: string
    category: string
    description: string
    severity: "low" | "medium" | "high" | "critical"
    status: string
    incidentDateTime: string
    location: string
    vehicleInfo?: {
      licensePlate: string
      make?: string
      model?: string
      color?: string
    }
    resident?: {
      name: string
      flatNumber: string
      building?: string
      email: string
      phone: string
    }
    reporter?: {
      name: string
      type: "resident" | "security" | "management"
    }
    evidence: Array<{
      type: "image" | "video"
      url: string
      thumbnail?: string
    }>
    priority: "low" | "medium" | "high" | "urgent"
    estimatedFine: number
  }
  onApprove: (violationId: string) => void
  onReject: (violationId: string, reason: string) => void
  onRequestMoreInfo: (violationId: string) => void
  isSelected: boolean
  onSelect: (violationId: string) => void
}

export function ViolationReviewCard({
  violation,
  onApprove,
  onReject,
  onRequestMoreInfo,
  isSelected,
  onSelect
}: ViolationReviewCardProps) {
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(violation._id, rejectReason)
      setRejectReason("")
      setShowRejectReason(false)
    }
  }

  const severityColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800", 
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  }

  const priorityColor = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-orange-600", 
    urgent: "text-red-600"
  }

  return (
    <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(violation._id)}
              className="mt-1"
            />
            <div>
              <CardTitle className="text-lg">
                {violation.category}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {violation.violationId}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={severityColor[violation.severity]}>
              {violation.severity.toUpperCase()}
            </Badge>
            <div className={`flex items-center text-sm ${priorityColor[violation.priority]}`}>
              <AlertTriangle className="w-4 h-4 mr-1" />
              {violation.priority}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm">{violation.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{format(new Date(violation.incidentDateTime), "MMM dd, yyyy HH:mm")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{violation.location}</span>
          </div>
        </div>

        {violation.vehicleInfo && (
          <div className="flex items-center space-x-2 text-sm">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span>
              {violation.vehicleInfo.licensePlate}
              {violation.vehicleInfo.make && ` - ${violation.vehicleInfo.make}`}
              {violation.vehicleInfo.model && ` ${violation.vehicleInfo.model}`}
              {violation.vehicleInfo.color && ` (${violation.vehicleInfo.color})`}
            </span>
          </div>
        )}

        {violation.resident && (
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {violation.resident.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{violation.resident.name}</p>
              <p className="text-muted-foreground">
                {violation.resident.building && `${violation.resident.building} - `}
                Flat {violation.resident.flatNumber}
              </p>
            </div>
          </div>
        )}

        {violation.reporter && (
          <div className="text-sm">
            <span className="text-muted-foreground">Reported by: </span>
            <span className="font-medium">{violation.reporter.name}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {violation.reporter.type}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Evidence:</span>
            <span>{violation.evidence.length} file(s)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Est. Fine:</span>
            <span className="font-semibold">₹{violation.estimatedFine}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRequestMoreInfo(violation._id)}
          >
            <Clock className="w-4 h-4 mr-2" />
            More Info
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRejectReason(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove(violation._id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>

        {showRejectReason && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <label className="text-sm font-medium">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full mt-2 p-2 text-sm border rounded resize-none"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRejectReason(false)
                  setRejectReason("")
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
