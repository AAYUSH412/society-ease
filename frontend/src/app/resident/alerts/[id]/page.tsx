'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  MessageSquare,
  Settings,
  RefreshCw,
  Eye
} from 'lucide-react'
import {
  ResidentAlert,
  getResidentAlert
} from '@/lib/api/resident-alerts'
import { ResidentAlertStatusBadge } from '@/components/alerts/resident/ResidentAlertStatusBadge'
import { ResidentAlertPriorityBadge } from '@/components/alerts/resident/ResidentAlertPriorityBadge'
import { ResidentAlertTypeIcon } from '@/components/alerts/resident/ResidentAlertTypeIcon'
import { QuickAlertActions } from '@/components/alerts/resident/QuickAlertActions'
import { DashboardLayout } from '@/components/dashboard'

export default function AlertDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const alertId = params.id as string

  const [alert, setAlert] = useState<ResidentAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlertDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getResidentAlert(alertId)
      
      if (response.success && response.data) {
        setAlert(response.data)
      } else {
        setError(response.message || 'Failed to fetch alert details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [alertId])

  useEffect(() => {
    if (alertId) {
      fetchAlertDetails()
    }
  }, [alertId, fetchAlertDetails])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start)
    const endTime = end ? new Date(end) : new Date()
    const diffMs = endTime.getTime() - startTime.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const handleAlertAction = () => {
    // Refresh alert details after any action
    fetchAlertDetails()
  }

  if (loading) {
    return (
      <DashboardLayout
        userName="John Doe" // TODO: Get from auth context
        userEmail="john@example.com" // TODO: Get from auth context
        notifications={3}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    )
  }

  if (error || !alert) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Alert</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'Alert not found'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button onClick={fetchAlertDetails}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOverdue = alert.status === 'active' && new Date() > new Date(alert.estimatedResolutionTime)
  const isOwner = alert.createdBy.userRole === 'resident'

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Alert Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <ResidentAlertTypeIcon type={alert.type} className="h-6 w-6 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl">{alert.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Alert ID: {alert.alertId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ResidentAlertPriorityBadge priority={alert.priority} />
                  <ResidentAlertStatusBadge status={alert.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {alert.description}
              </p>

              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">
                      This alert is overdue by {formatDuration(alert.estimatedResolutionTime)}
                    </span>
                  </div>
                </div>
              )}

              {alert.escalation?.isEscalated && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Alert Escalated</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Escalated on {formatDate(alert.escalation.escalatedAt!)}
                  </p>
                  {alert.escalation.escalationReason && (
                    <p className="text-sm text-orange-700 mt-1">
                      Reason: {alert.escalation.escalationReason}
                    </p>
                  )}
                </div>
              )}

              {alert.tags && alert.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {alert.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Alert Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="font-medium">{alert.createdBy.userName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(alert.createdDate)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Start time:</span>
                  <span>{formatDate(alert.startTime)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expected resolution:</span>
                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {formatDate(alert.estimatedResolutionTime)}
                  </span>
                </div>

                {alert.scheduledTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Scheduled time:</span>
                    <span>{formatDate(alert.scheduledTime)}</span>
                  </div>
                )}

                {alert.actualResolutionTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Resolved at:</span>
                    <span className="text-green-600 font-medium">
                      {formatDate(alert.actualResolutionTime)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{formatDuration(alert.startTime, alert.actualResolutionTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affected Areas */}
          {alert.visibility.scope !== 'all' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Affected Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alert.visibility.scope === 'specific_buildings' && alert.visibility.affectedAreas.buildings && (
                    <div>
                      <p className="text-sm font-medium mb-2">Buildings:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.visibility.affectedAreas.buildings.map((building, index) => (
                          <Badge key={index} variant="outline">
                            Building {building}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {alert.visibility.scope === 'specific_flats' && alert.visibility.affectedAreas.flats && (
                    <div>
                      <p className="text-sm font-medium mb-2">Flats:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.visibility.affectedAreas.flats.map((flat, index) => (
                          <Badge key={index} variant="outline">
                            {flat.building}-{flat.flatNumber}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {alert.visibility.scope === 'specific_areas' && alert.visibility.affectedAreas.areas && (
                    <div>
                      <p className="text-sm font-medium mb-2">Areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.visibility.affectedAreas.areas.map((area, index) => (
                          <Badge key={index} variant="outline">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Updates Timeline */}
          {alert.updates && alert.updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Updates & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alert.updates.map((update, index) => (
                    <div key={update.updateId} className="relative">
                      {index !== alert.updates.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
                      )}
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm mb-2">{update.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="font-medium">{update.updatedBy.userName}</span>
                              <span>{formatDate(update.timestamp)}</span>
                              <Badge variant="outline" className="text-xs">
                                {update.updateType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resolution Details */}
          {alert.resolution && alert.status === 'resolved' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Eye className="h-5 w-5" />
                  Resolution Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alert.resolution.resolutionNotes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Resolution Notes:</p>
                      <p className="text-sm text-muted-foreground bg-green-50 border border-green-200 rounded-lg p-3">
                        {alert.resolution.resolutionNotes}
                      </p>
                    </div>
                  )}
                  
                  {alert.resolution.resolvedBy && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Resolved by:</span>
                      <span className="font-medium">{alert.resolution.resolvedBy.userName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickAlertActions
            alert={alert}
            onSuccess={handleAlertAction}
            isOwner={isOwner}
          />

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Society:</span>
                <p className="font-medium">{alert.visibility.societyName}</p>
              </div>
              
              {alert.autoClose?.enabled && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Auto-close:</span>
                  <p className="font-medium">
                    After {alert.autoClose.afterHours} hours
                  </p>
                </div>
              )}
              
              <div className="text-sm">
                <span className="text-muted-foreground">Last updated:</span>
                <p className="font-medium">{formatDate(alert.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
