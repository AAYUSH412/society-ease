"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  MoreHorizontal,
  User,
  FileText,
  Send,
  Archive
} from "lucide-react"
import { toast } from "sonner"

interface ViolationActionsProps {
  violation: {
    id: string
    status: "pending" | "under_review" | "approved" | "rejected" | "resolved" | "dismissed"
    assignedTo?: string
  }
  onStatusUpdate: (status: string, note?: string) => Promise<void>
  onAssignReviewer: (reviewerId: string) => Promise<void>
  onAddNote: (note: string) => Promise<void>
  currentUser: {
    id: string
    name: string
    role: string
  }
  isLoading?: boolean
}

export function ViolationActions({
  violation,
  onStatusUpdate,
  onAddNote,
  isLoading = false
}: ViolationActionsProps) {
  const [noteDialog, setNoteDialog] = useState(false)
  const [statusDialog, setStatusDialog] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [actionNote, setActionNote] = useState("")

  const handleStatusUpdate = async (status: string) => {
    try {
      await onStatusUpdate(status, actionNote)
      setStatusDialog(null)
      setActionNote("")
      toast.success(`Violation ${status.replace('_', ' ')} successfully`)
    } catch {
      toast.error(`Failed to ${status.replace('_', ' ')} violation`)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    
    try {
      await onAddNote(note)
      setNote("")
      setNoteDialog(false)
      toast.success("Note added successfully")
    } catch {
      toast.error("Failed to add note")
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

  const canApprove = violation.status === "pending" || violation.status === "under_review"
  const canReject = violation.status === "pending" || violation.status === "under_review"
  const canResolve = violation.status === "approved"
  const canReview = violation.status === "pending"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Actions</span>
          <Badge className={getStatusColor(violation.status)}>
            {violation.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="flex flex-col space-y-2">
          {canReview && (
            <Button
              onClick={() => onStatusUpdate("under_review")}
              disabled={isLoading}
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Start Review
            </Button>
          )}
          
          {canApprove && (
            <Dialog open={statusDialog === "approved"} onOpenChange={(open) => setStatusDialog(open ? "approved" : null)}>
              <DialogTrigger asChild>
                <Button variant="default" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Violation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Violation</DialogTitle>
                  <DialogDescription>
                    Confirm this violation and add any additional notes.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="approve-note">Additional Notes (Optional)</Label>
                  <Textarea
                    id="approve-note"
                    placeholder="Add any additional notes about this approval..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusDialog(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleStatusUpdate("approved")} disabled={isLoading}>
                    Approve Violation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {canReject && (
            <Dialog open={statusDialog === "rejected"} onOpenChange={(open) => setStatusDialog(open ? "rejected" : null)}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Violation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Violation</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this violation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reject-note">Reason for Rejection *</Label>
                  <Textarea
                    id="reject-note"
                    placeholder="Explain why this violation is being rejected..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusDialog(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusUpdate("rejected")} 
                    disabled={isLoading || !actionNote.trim()}
                  >
                    Reject Violation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {canResolve && (
            <Dialog open={statusDialog === "resolved"} onOpenChange={(open) => setStatusDialog(open ? "resolved" : null)}>
              <DialogTrigger asChild>
                <Button variant="default" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark as Resolved</DialogTitle>
                  <DialogDescription>
                    Confirm that this violation has been resolved and add any final notes.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="resolve-note">Resolution Notes (Optional)</Label>
                  <Textarea
                    id="resolve-note"
                    placeholder="Add any notes about how this violation was resolved..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusDialog(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleStatusUpdate("resolved")} disabled={isLoading}>
                    Mark as Resolved
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Separator />

        {/* Secondary Actions */}
        <div className="space-y-2">
          <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note</DialogTitle>
                <DialogDescription>
                  Add a note to this violation for internal reference.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Enter your note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!note.trim() || isLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setStatusDialog("dismissed")}>
                <Archive className="h-4 w-4 mr-2" />
                Dismiss Violation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {/* Handle assign reviewer */}}>
                <User className="h-4 w-4 mr-2" />
                Assign Reviewer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* Handle export */}}>
                <FileText className="h-4 w-4 mr-2" />
                Export Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Current Assignment */}
        {violation.assignedTo && (
          <>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Assigned to: {violation.assignedTo}</span>
              </div>
            </div>
          </>
        )}

        {/* Dismiss Dialog */}
        <Dialog open={statusDialog === "dismissed"} onOpenChange={(open) => setStatusDialog(open ? "dismissed" : null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dismiss Violation</DialogTitle>
              <DialogDescription>
                This will dismiss the violation without taking action. Please provide a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="dismiss-note">Reason for Dismissal *</Label>
              <Textarea
                id="dismiss-note"
                placeholder="Explain why this violation is being dismissed..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialog(null)}>
                Cancel
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleStatusUpdate("dismissed")} 
                disabled={isLoading || !actionNote.trim()}
              >
                Dismiss Violation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
