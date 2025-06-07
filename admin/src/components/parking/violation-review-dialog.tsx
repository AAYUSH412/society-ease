"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ViolationStatusBadge } from "@/components/shared/violation-status-badge"
import { SeverityIndicator } from "@/components/shared/severity-indicator"
import { ViolationTypeIcon } from "@/components/shared/violation-type-icon"
import * as violationApi from "@/lib/api/parking/violations"
import * as fineApi from "@/lib/api/parking/fines"
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  Send,
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
  fine?: {
    amount: number
    status: "pending" | "paid" | "waived"
  }
  notes?: string
  adminNotes?: string
}

interface ViolationReviewDialogProps {
  violation: Violation
  open: boolean
  onOpenChange: (open: boolean) => void
  onViolationUpdated: () => void
}

export function ViolationReviewDialog({
  violation,
  open,
  onOpenChange,
  onViolationUpdated,
}: ViolationReviewDialogProps) {
  const [action, setAction] = useState<"approve" | "dismiss" | "fine" | "warn" | "review">()
  const [adminNotes, setAdminNotes] = useState(violation.adminNotes || "")
  const [fineAmount, setFineAmount] = useState(500)
  const [fineDescription, setFineDescription] = useState("")
  const [warningMessage, setWarningMessage] = useState("")
  const [notifyResident, setNotifyResident] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!action) return

    setLoading(true)
    try {
      let updatedStatus = violation.status

      switch (action) {
        case "approve":
          updatedStatus = "resolved"
          await violationApi.updateViolationStatus(violation.id, updatedStatus, adminNotes)
          break

        case "dismiss":
          updatedStatus = "dismissed"
          await violationApi.updateViolationStatus(violation.id, updatedStatus, adminNotes)
          break

        case "review":
          updatedStatus = "under_review"
          await violationApi.updateViolationStatus(violation.id, updatedStatus, adminNotes)
          break

        case "fine":
          await fineApi.issueFine({
            violationId: violation.id,
            fineAmount: fineAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            adminNotes: fineDescription || `Fine for ${violation.type.replace("_", " ")} violation`,
          })
          await violationApi.updateViolationStatus(violation.id, "resolved", adminNotes)
          break

        case "warn":
          // Send warning notification
          await violationApi.updateViolationStatus(violation.id, "resolved", `${adminNotes}\n\nWarning issued: ${warningMessage}`)
          break
      }

      // TODO: Implement notification logic when needed
      // if (notifyResident) {
      //   await violationApi.sendNotification(violation.id, {
      //     action,
      //     message: adminNotes,
      //     fineAmount: action === "fine" ? fineAmount : undefined,
      //     warningMessage: action === "warn" ? warningMessage : undefined,
      //   })
      // }

      onViolationUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to review violation:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "dismiss":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "fine":
        return <DollarSign className="h-4 w-4 text-purple-500" />
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "review":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getActionDescription = (actionType: string) => {
    switch (actionType) {
      case "approve":
        return "Mark violation as resolved without penalty"
      case "dismiss":
        return "Dismiss violation as invalid or resolved"
      case "fine":
        return "Issue monetary fine to the resident"
      case "warn":
        return "Send warning notification to resident"
      case "review":
        return "Mark for further review and investigation"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <ViolationTypeIcon type={violation.type} className="h-6 w-6" />
            <div>
              <DialogTitle>Review Violation</DialogTitle>
              <DialogDescription>
                {violation.resident.name} • {violation.resident.flatNumber} • {violation.type.replace("_", " ")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ViolationStatusBadge status={violation.status} />
                  <SeverityIndicator severity={violation.severity} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Reported: {new Date(violation.reportedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Action</CardTitle>
              <CardDescription>
                Choose how to handle this violation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={action} onValueChange={(value: "approve" | "dismiss" | "fine" | "warn" | "review") => setAction(value)}>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { value: "approve", label: "Approve & Resolve", color: "text-green-600" },
                    { value: "dismiss", label: "Dismiss Violation", color: "text-red-600" },
                    { value: "fine", label: "Issue Fine", color: "text-purple-600" },
                    { value: "warn", label: "Send Warning", color: "text-orange-600" },
                    { value: "review", label: "Mark for Review", color: "text-blue-600" },
                  ].map((actionOption) => (
                    <div key={actionOption.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={actionOption.value} id={actionOption.value} />
                      <Label
                        htmlFor={actionOption.value}
                        className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {getActionIcon(actionOption.value)}
                          <div>
                            <div className={`font-medium ${actionOption.color}`}>
                              {actionOption.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getActionDescription(actionOption.value)}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Action-specific fields */}
          {action === "fine" && (
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
                    <Label htmlFor="fineAmount">Fine Amount (₹)</Label>
                    <Input
                      id="fineAmount"
                      type="number"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(Number(e.target.value))}
                      min="0"
                      step="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fineTemplate">Quick Amount</Label>
                    <Select onValueChange={(value) => setFineAmount(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">₹250 - Minor violation</SelectItem>
                        <SelectItem value="500">₹500 - Standard fine</SelectItem>
                        <SelectItem value="1000">₹1000 - Serious violation</SelectItem>
                        <SelectItem value="2000">₹2000 - Repeat offense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fineDescription">Fine Description</Label>
                  <Textarea
                    id="fineDescription"
                    value={fineDescription}
                    onChange={(e) => setFineDescription(e.target.value)}
                    placeholder="Reason for the fine..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {action === "warn" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Warning Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Enter warning message to send to resident..."
                  rows={4}
                />
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Admin Notes
              </CardTitle>
              <CardDescription>
                Internal notes about this violation review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this review..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Notification Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyResident"
                  checked={notifyResident}
                  onCheckedChange={(checked) => setNotifyResident(checked === true)}
                />
                <Label htmlFor="notifyResident">
                  Send notification to resident about this action
                </Label>
              </div>
              {notifyResident && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Notification will include:</div>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Action taken on violation</li>
                      <li>• Admin notes (if provided)</li>
                      {action === "fine" && <li>• Fine amount and due date</li>}
                      {action === "warn" && <li>• Warning message</li>}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!action || loading}
            className="min-w-24"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
