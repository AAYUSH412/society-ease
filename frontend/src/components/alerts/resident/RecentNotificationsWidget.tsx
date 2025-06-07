"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ResidentAlertTypeIcon } from "./ResidentAlertTypeIcon"
import { getResidentAlerts, ResidentAlert } from "@/lib/api/resident-alerts"
import { useRouter } from "next/navigation"
import { Bell, Clock, ArrowRight, ExternalLink } from "lucide-react"

interface RecentNotificationsWidgetProps {
  onViewAlert?: (alert: ResidentAlert) => void
  maxItems?: number
}

export function RecentNotificationsWidget({ 
  onViewAlert, 
  maxItems = 5 
}: RecentNotificationsWidgetProps) {
  const [notifications, setNotifications] = useState<ResidentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getResidentAlerts({ 
        limit: maxItems,
        sortBy: 'createdDate',
        sortOrder: 'desc'
      })
      
      if (response.success && response.data) {
        setNotifications(response.data.alerts || [])
      } else {
        setError(response.message || 'Failed to load notifications')
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching recent notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [maxItems])

  useEffect(() => {
    fetchRecentNotifications()
  }, [fetchRecentNotifications])

  const handleViewAlert = (alert: ResidentAlert) => {
    onViewAlert?.(alert)
    router.push(`/resident/alerts/${alert._id}`)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>Latest alerts and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>Latest alerts and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRecentNotifications}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Notifications
          {notifications.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Latest alerts and updates</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No recent notifications</p>
            <p className="text-xs text-muted-foreground mt-2">
              New alerts will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleViewAlert(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  <ResidentAlertTypeIcon type={notification.type} className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(notification.priority)}`}
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {notification.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(notification.createdDate)}
                    </div>
                    
                    <Badge 
                      variant={notification.status === 'active' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            ))}
            
            {notifications.length > 0 && (
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => router.push('/resident/alerts')}
                >
                  View All Alerts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
