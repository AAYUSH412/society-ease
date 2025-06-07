"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertTriangle, User, MoreHorizontal } from "lucide-react"

interface ReviewBulkActionsProps {
  selectedViolations: string[]
  onBulkApprove: (violationIds: string[], reason?: string) => Promise<void>
  onBulkReject: (violationIds: string[], reason: string) => Promise<void>
  onBulkAssign: (violationIds: string[], reviewerId: string) => Promise<void>
  onClearSelection: () => void
  reviewers: Array<{
    id: string
    name: string
    role: string
  }>
}

export function ReviewBulkActions({
  selectedViolations,
  onBulkApprove,
  onBulkReject,
  onBulkAssign,
  onClearSelection,
  reviewers
}: ReviewBulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBulkAction = async (action: string, data?: { reason?: string; reviewerId?: string }) => {
    setIsProcessing(true)
    try {
      switch (action) {
        case 'approve':
          await onBulkApprove(selectedViolations, data?.reason)
          break
        case 'reject':
          await onBulkReject(selectedViolations, data?.reason || 'Bulk rejection')
          break
        case 'assign':
          if (data?.reviewerId) {
            await onBulkAssign(selectedViolations, data.reviewerId)
          }
          break
      }
      onClearSelection()
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedViolations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Bulk Actions
          </CardTitle>
          <Badge variant="secondary">
            {selectedViolations.length} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="default"
            onClick={() => handleBulkAction('approve')}
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve All
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBulkAction('reject', { reason: 'Bulk rejection' })}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject All
          </Button>

          <Select
            onValueChange={(reviewerId) => 
              handleBulkAction('assign', { reviewerId })
            }
            disabled={isProcessing}
          >
            <SelectTrigger className="w-[160px] h-8">
              <User className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              {reviewers.map((reviewer) => (
                <SelectItem key={reviewer.id} value={reviewer.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{reviewer.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {reviewer.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <Button
            size="sm"
            variant="outline"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear Selection
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" disabled={isProcessing}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark as Priority
              </DropdownMenuItem>
              <DropdownMenuItem>
                Send Reminder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Export Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
