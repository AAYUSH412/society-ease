'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Send,
  Calendar,
  Clock
} from 'lucide-react'
import {
  ResidentAlert,
  addAlertUpdate,
  escalateAlert,
  resolveAlert,
  AddAlertUpdateRequest,
  EscalateAlertRequest,
  ResolveAlertRequest
} from '@/lib/api/resident-alerts'

interface QuickAlertActionsProps {
  alert: ResidentAlert
  onSuccess?: (action: string, alert: ResidentAlert) => void
  isOwner?: boolean
  className?: string
}

export const QuickAlertActions: React.FC<QuickAlertActionsProps> = ({
  alert,
  onSuccess,
  isOwner = false,
  className = ''
}) => {
  const [loading, setLoading] = useState<string | null>(null)
  const [updateMessage, setUpdateMessage] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const canEscalate = alert.status === 'active' && !alert.escalation?.isEscalated
  const canResolve = alert.status === 'active' && isOwner
  const canUpdate = alert.status === 'active'

  const handleAddUpdate = async () => {
    if (!updateMessage.trim()) {
      setErrors({ update: 'Update message is required' })
      return
    }

    try {
      setLoading('update')
      setErrors({})

      const updateData: AddAlertUpdateRequest = {
        message: updateMessage.trim(),
        updateType: 'progress'
      }

      const response = await addAlertUpdate(alert._id, updateData)
      
      if (response.success) {
        setUpdateMessage('')
        onSuccess?.('update', alert)
      } else {
        setErrors({ update: response.message || 'Failed to add update' })
      }
    } catch (err) {
      setErrors({ 
        update: err instanceof Error ? err.message : 'An error occurred' 
      })
    } finally {
      setLoading(null)
    }
  }

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      setErrors({ escalate: 'Escalation reason is required' })
      return
    }

    try {
      setLoading('escalate')
      setErrors({})

      const escalationData: EscalateAlertRequest = {
        reason: escalationReason.trim()
      }

      const response = await escalateAlert(alert._id, escalationData)
      
      if (response.success) {
        setEscalationReason('')
        onSuccess?.('escalate', alert)
      } else {
        setErrors({ escalate: response.message || 'Failed to escalate alert' })
      }
    } catch (err) {
      setErrors({ 
        escalate: err instanceof Error ? err.message : 'An error occurred' 
      })
    } finally {
      setLoading(null)
    }
  }

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      setErrors({ resolve: 'Resolution notes are required' })
      return
    }

    try {
      setLoading('resolve')
      setErrors({})

      const resolutionData: ResolveAlertRequest = {
        resolutionNotes: resolutionNotes.trim()
      }

      const response = await resolveAlert(alert._id, resolutionData)
      
      if (response.success) {
        setResolutionNotes('')
        onSuccess?.('resolve', alert)
      } else {
        setErrors({ resolve: response.message || 'Failed to resolve alert' })
      }
    } catch (err) {
      setErrors({ 
        resolve: err instanceof Error ? err.message : 'An error occurred' 
      })
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Alert Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(alert.createdDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Expected resolution:</span>
              <span>{formatDate(alert.estimatedResolutionTime)}</span>
            </div>
            {alert.escalation?.isEscalated && (
              <div className="text-sm text-orange-600 font-medium">
                ⚠️ This alert has been escalated
              </div>
            )}
          </div>

          {/* Add Update */}
          {canUpdate && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Update to Alert</DialogTitle>
                  <DialogDescription>
                    Provide an update on the current status of this alert.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="updateMessage">Update Message</Label>
                    <Textarea
                      id="updateMessage"
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Describe the current status, progress made, or any relevant information..."
                      className="min-h-[100px]"
                    />
                    {errors.update && (
                      <p className="text-sm text-red-500">{errors.update}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleAddUpdate} 
                    disabled={loading === 'update'}
                    className="w-full"
                  >
                    {loading === 'update' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {loading === 'update' ? 'Adding Update...' : 'Add Update'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Escalate Alert */}
          {canEscalate && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Escalate Alert</DialogTitle>
                  <DialogDescription>
                    Escalate this alert to get higher priority attention. Please provide a reason for escalation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="escalationReason">Reason for Escalation</Label>
                    <Textarea
                      id="escalationReason"
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      placeholder="Explain why this alert needs to be escalated (e.g., emergency situation, lack of response, impact on safety...)"
                      className="min-h-[100px]"
                    />
                    {errors.escalate && (
                      <p className="text-sm text-red-500">{errors.escalate}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleEscalate} 
                    disabled={loading === 'escalate'}
                    variant="destructive"
                    className="w-full"
                  >
                    {loading === 'escalate' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    {loading === 'escalate' ? 'Escalating...' : 'Escalate Alert'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Resolve Alert */}
          {canResolve && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resolve Alert</DialogTitle>
                  <DialogDescription>
                    Mark this alert as resolved. Please provide details about how the issue was resolved.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                    <Textarea
                      id="resolutionNotes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved, any actions taken, or follow-up required..."
                      className="min-h-[100px]"
                    />
                    {errors.resolve && (
                      <p className="text-sm text-red-500">{errors.resolve}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleResolve} 
                    disabled={loading === 'resolve'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading === 'resolve' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {loading === 'resolve' ? 'Resolving...' : 'Mark as Resolved'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {!canUpdate && !canEscalate && !canResolve && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No actions available for this alert
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
