'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Eye, Plus } from 'lucide-react'
import { ResidentAlert, getActiveAlertsForResident } from '@/lib/api/resident-alerts'
import { ResidentAlertCard } from './ResidentAlertCard'

interface ActiveAlertsWidgetProps {
  onViewAlert?: (alert: ResidentAlert) => void
  onCreateAlert?: () => void
  maxItems?: number
  showCreateButton?: boolean
}

export const ActiveAlertsWidget: React.FC<ActiveAlertsWidgetProps> = ({
  onViewAlert,
  onCreateAlert,
  maxItems = 3,
  showCreateButton = true
}) => {
  const [alerts, setAlerts] = useState<ResidentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getActiveAlertsForResident()
      
      if (response.success && response.data) {
        setAlerts(response.data.slice(0, maxItems))
      } else {
        setError(response.message || 'Failed to fetch active alerts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [maxItems])

  useEffect(() => {
    fetchActiveAlerts()
  }, [fetchActiveAlerts])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Failed to load alerts</p>
            <Button variant="outline" size="sm" onClick={fetchActiveAlerts}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          {showCreateButton && (
            <Button variant="outline" size="sm" onClick={onCreateAlert}>
              <Plus className="h-4 w-4 mr-1" />
              New Alert
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No active alerts</p>
            <p className="text-xs text-muted-foreground">All systems are running normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <ResidentAlertCard
                key={alert._id}
                alert={alert}
                onView={onViewAlert}
                compact={true}
                showActions={false}
              />
            ))}
            {alerts.length === maxItems && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  // Navigate to full alerts page
                  window.location.href = '/resident/alerts'
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View All Alerts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
