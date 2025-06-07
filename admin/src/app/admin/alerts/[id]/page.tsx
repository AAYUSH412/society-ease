'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Alert, getAlert, updateAlert, addAlertUpdate, deleteAlert } from '@/lib/api/alerts'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertStatusBadge } from '@/components/alerts/AlertStatusBadge'
import { AlertPriorityBadge } from '@/components/alerts/AlertPriorityBadge'
import { AlertTypeIcon } from '@/components/alerts/AlertTypeIcon'
import { AlertUpdateDialog } from '@/components/alerts/AlertUpdateDialog'
import { AlertDeleteDialog } from '@/components/alerts/AlertDeleteDialog'
import { AlertTimeline } from '@/components/alerts/AlertTimeline'
import { AlertVisibility } from '@/components/alerts/AlertVisibility'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  User,
  Tag,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  Plus
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

const AlertDetailPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const alertId = params.id as string

  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false)

  // Update form states
  const [newStatus, setNewStatus] = useState<string>('')
  const [resolutionNotes, setResolutionNotes] = useState('')

  useEffect(() => {
    const loadAlert = async () => {
      try {
        setLoading(true)
        const response = await getAlert(alertId)
        if (response.success && response.data) {
          setAlert(response.data)
        } else {
          console.error('Failed to load alert:', response.message)
        }
      } catch (error) {
        console.error('Error loading alert:', error)
      } finally {
        setLoading(false)
      }
    }

    if (alertId) {
      loadAlert()
    }
  }, [alertId])

  const handleStatusUpdate = async () => {
    if (!alert || !newStatus) return

    try {
      setUpdating(true)
      const updateData: Partial<Alert> = {
        status: newStatus as Alert['status']
      }

      if (newStatus === 'resolved' && resolutionNotes) {
        updateData.resolution = {
          resolutionNotes,
          resolvedBy: {
            userId: 'current-user-id', // This should come from auth context
            userName: 'Current User',
            userRole: 'admin'
          }
        }
      }

      const response = await updateAlert(alertId, updateData)
      if (response.success && response.data) {
        setAlert(response.data)
        setStatusUpdateDialogOpen(false)
        setNewStatus('')
        setResolutionNotes('')
      } else {
        console.error('Failed to update alert status:', response.message)
      }
    } catch (error) {
      console.error('Error updating alert status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAddUpdate = async (updateData: {
    message: string
    updateType: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general'
  }) => {
    try {
      setUpdating(true)
      const response = await addAlertUpdate(alertId, {
        ...updateData,
        updatedBy: {
          userId: 'current-user-id', // This should come from auth context
          userName: 'Current User',
          userRole: 'admin'
        }
      })

      if (response.success && response.data) {
        setAlert(response.data)
        setUpdateDialogOpen(false)
      } else {
        console.error('Failed to add update:', response.message)
      }
    } catch (error) {
      console.error('Error adding update:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setUpdating(true)
      const response = await deleteAlert(alertId)
      if (response.success) {
        router.push('/admin/alerts')
      } else {
        console.error('Failed to delete alert:', response.message)
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    } finally {
      setUpdating(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!alert) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Alert Not Found</h2>
          <p className="text-gray-500 mb-4">The alert you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/alerts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Alerts
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/alerts')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Alerts
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{alert.title}</h1>
              <p className="text-sm text-gray-500">Alert ID: {alert.alertId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusUpdateDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Update
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-4">
          <AlertStatusBadge status={alert.status} />
          <AlertPriorityBadge priority={alert.priority} />
          <div className="flex items-center text-sm text-gray-500">
            <AlertTypeIcon type={alert.type} className="h-4 w-4" />
            <span className="ml-1 capitalize">{alert.type}</span>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="updates">Updates ({alert.updates?.length || 0})</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Description</h4>
                      <p className="text-gray-900">{alert.description}</p>
                    </div>
                    
                    {alert.tags && alert.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {alert.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {alert.resolution?.resolutionNotes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Resolution Notes</h4>
                        <p className="text-gray-900">{alert.resolution.resolutionNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(alert.createdDate), 'PPP')} at {format(new Date(alert.startTime), 'p')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Estimated Resolution</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(alert.estimatedResolutionTime), 'PPP')} at {format(new Date(alert.estimatedResolutionTime), 'p')}
                          </p>
                        </div>
                      </div>

                      {alert.actualResolutionTime && (
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Actually Resolved</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(alert.actualResolutionTime), 'PPP')} at {format(new Date(alert.actualResolutionTime), 'p')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Created By */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Created By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{alert.createdBy.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.createdBy.userRole.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {alert.createdBy.userContact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{alert.createdBy.userContact.email}</span>
                        </div>
                      )}
                      {alert.createdBy.userContact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{alert.createdBy.userContact.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Auto Close */}
                {alert.autoClose?.enabled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auto Close</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Will auto-close after {alert.autoClose.afterHours} hours
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Escalation */}
                {alert.escalation?.isEscalated && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-orange-600">Escalated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">Level: {alert.escalation.escalationLevel}</p>
                        {alert.escalation.escalationReason && (
                          <p className="text-sm text-gray-600">{alert.escalation.escalationReason}</p>
                        )}
                        {alert.escalation.escalatedAt && (
                          <p className="text-xs text-gray-500">
                            Escalated {formatDistanceToNow(new Date(alert.escalation.escalatedAt))} ago
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Alert Updates</h3>
              <Button
                size="sm"
                onClick={() => setUpdateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            </div>

            <AlertTimeline 
              updates={(alert.updates || []).map(update => ({
                _id: update.updateId,
                message: update.message,
                updateType: update.updateType,
                timestamp: update.timestamp,
                updatedBy: update.updatedBy
              }))} 
            />
          </TabsContent>

          <TabsContent value="visibility" className="space-y-4">
            <AlertVisibility 
              visibility={{
                scope: alert.visibility.scope === 'all' ? 'society_wide' : 
                       alert.visibility.scope === 'specific_buildings' ? 'building_specific' :
                       alert.visibility.scope === 'specific_flats' ? 'unit_specific' : 'society_wide',
                buildings: alert.visibility.affectedAreas.buildings,
                units: alert.visibility.affectedAreas.flats?.map(flat => `${flat.building}-${flat.flatNumber}`)
              }} 
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Alert Created</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(alert.createdAt), 'PPP')} at {format(new Date(alert.createdAt), 'p')}
                      </p>
                    </div>
                  </div>
                  
                  {alert.updatedAt !== alert.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(alert.updatedAt), 'PPP')} at {format(new Date(alert.updatedAt), 'p')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        
        {/* Status Update Dialog */}
        <Dialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Alert Status</DialogTitle>
              <DialogDescription>
                Change the status of this alert and add resolution notes if needed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newStatus === 'resolved' && (
                <div>
                  <label className="text-sm font-medium">Resolution Notes</label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the issue was resolved..."
                    rows={3}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={!newStatus || updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Update Dialog */}
        <AlertUpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onSubmit={handleAddUpdate}
          loading={updating}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          loading={updating}
          alertTitle={alert.title}
        />
      </div>
    </AdminLayout>
  )
}

export default AlertDetailPage
