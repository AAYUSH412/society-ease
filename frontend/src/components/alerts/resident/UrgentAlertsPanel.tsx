"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ResidentAlertStatusBadge } from "./ResidentAlertStatusBadge"
import { ResidentAlertPriorityBadge } from "./ResidentAlertPriorityBadge"
import { ResidentAlertTypeIcon } from "./ResidentAlertTypeIcon"
import { getActiveAlertsForResident, ResidentAlert } from "@/lib/api/resident-alerts"
import { useRouter } from "next/navigation"
import { AlertTriangle, Clock, ArrowRight } from "lucide-react"

export function UrgentAlertsPanel() {
  const [alerts, setAlerts] = useState<ResidentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUrgentAlerts()
  }, [])

  const fetchUrgentAlerts = async () => {
    try {
      setLoading(true)
      const response = await getActiveAlertsForResident()
      
      if (response.success && response.data) {
        // Filter for only critical and high priority alerts
        const urgentAlerts = response.data.filter((alert: ResidentAlert) => 
          alert.priority === 'critical' || alert.priority === 'high'
        )
        setAlerts(urgentAlerts.slice(0, 3)) // Show max 3 urgent alerts
      } else {
        setError(response.message || 'Failed to load urgent alerts')
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching urgent alerts:', err)
      setError('Failed to load urgent alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleViewAlert = (alertId: string) => {
    router.push(`/resident/alerts/${alertId}`)
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Urgent Alerts
          </CardTitle>
          <CardDescription>High priority alerts requiring immediate attention</CardDescription>
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
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Urgent Alerts
          </CardTitle>
          <CardDescription>High priority alerts requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUrgentAlerts}
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
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Urgent Alerts
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>High priority alerts requiring immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No urgent alerts at the moment</p>
            <p className="text-xs text-muted-foreground mt-2">
              Critical and high priority alerts will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleViewAlert(alert._id)}
              >
                <div className="flex-shrink-0 mt-1">
                  <ResidentAlertTypeIcon type={alert.type} className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                    <ResidentAlertPriorityBadge priority={alert.priority} />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ResidentAlertStatusBadge status={alert.status} />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(alert.createdDate)}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      View
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.length > 0 && (
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => router.push('/resident/alerts?priority=critical,high')}
                >
                  View All Urgent Alerts
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
