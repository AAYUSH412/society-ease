'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, MapPin, AlertTriangle, Settings, Eye } from 'lucide-react'
import { ResidentAlert } from '@/lib/api/resident-alerts'
import { ResidentAlertStatusBadge } from '@/components/alerts/resident/ResidentAlertStatusBadge'
import { ResidentAlertPriorityBadge } from '@/components/alerts/resident/ResidentAlertPriorityBadge'
import { ResidentAlertTypeIcon } from '@/components/alerts/resident/ResidentAlertTypeIcon'

interface ResidentAlertCardProps {
  alert: ResidentAlert
  onView?: (alert: ResidentAlert) => void
  onUpdate?: (alert: ResidentAlert) => void
  onEscalate?: (alert: ResidentAlert) => void
  onResolve?: (alert: ResidentAlert) => void
  showActions?: boolean
  isOwner?: boolean
  compact?: boolean
}

export const ResidentAlertCard: React.FC<ResidentAlertCardProps> = ({
  alert,
  onView,
  onUpdate,
  onEscalate,
  onResolve,
  showActions = true,
  isOwner = false,
  compact = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start)
    const endTime = end ? new Date(end) : new Date()
    const diffMs = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const isOverdue = alert.status === 'active' && new Date() > new Date(alert.estimatedResolutionTime)
  const canResolve = isOwner

  if (compact) {
    return (
      <Card className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
        isOverdue ? 'border-red-200 bg-red-50' : ''
      }`} onClick={() => onView?.(alert)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ResidentAlertTypeIcon type={alert.type} className="h-4 w-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {alert.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ResidentAlertPriorityBadge priority={alert.priority} size="sm" />
              <ResidentAlertStatusBadge status={alert.status} size="sm" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(alert.createdDate)}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isOverdue ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ResidentAlertTypeIcon type={alert.type} className="h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{alert.title}</CardTitle>
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

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {alert.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
            <span className="text-muted-foreground">Duration:</span>
            <span>{formatDuration(alert.startTime, alert.actualResolutionTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expected:</span>
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {formatDate(alert.estimatedResolutionTime)}
            </span>
          </div>
        </div>

        {alert.visibility.scope !== 'all' && (
          <div className="flex items-start gap-2 text-sm mb-4">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-muted-foreground">Affected areas:</span>
              <div className="mt-1">
                {alert.visibility.scope === 'specific_buildings' && alert.visibility.affectedAreas.buildings && (
                  <div className="flex flex-wrap gap-1">
                    {alert.visibility.affectedAreas.buildings.map((building, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        Building {building}
                      </Badge>
                    ))}
                  </div>
                )}
                {alert.visibility.scope === 'specific_flats' && alert.visibility.affectedAreas.flats && (
                  <div className="flex flex-wrap gap-1">
                    {alert.visibility.affectedAreas.flats.map((flat, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flat.building}-{flat.flatNumber}
                      </Badge>
                    ))}
                  </div>
                )}
                {alert.visibility.scope === 'specific_areas' && alert.visibility.affectedAreas.areas && (
                  <div className="flex flex-wrap gap-1">
                    {alert.visibility.affectedAreas.areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {alert.tags && alert.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {alert.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                This alert is overdue by {formatDuration(alert.estimatedResolutionTime)}
              </span>
            </div>
          </div>
        )}

        {alert.updates && alert.updates.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Latest Update:</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm">{alert.updates[alert.updates.length - 1].message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(alert.updates[alert.updates.length - 1].timestamp)} by {alert.updates[alert.updates.length - 1].updatedBy.userName}
              </p>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(alert)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              View Details
            </Button>

            {alert.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdate?.(alert)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Add Update
                </Button>

                {!alert.escalation?.isEscalated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEscalate?.(alert)}
                    className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Escalate
                  </Button>
                )}

                {canResolve && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolve?.(alert)}
                    className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Resolve
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
