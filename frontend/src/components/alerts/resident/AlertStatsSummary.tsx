'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { getResidentAlertStats } from '@/lib/api/resident-alerts'

interface AlertStatsData {
  totalAlertsAffecting: number
  activeAlertsAffecting: number
  myCreatedAlerts: number
  myResolvedAlerts: number
}

interface AlertStatsSummaryProps {
  onRefresh?: () => void
}

export const AlertStatsSummary: React.FC<AlertStatsSummaryProps> = ({
  onRefresh
}) => {
  const [stats, setStats] = useState<AlertStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getResidentAlertStats()
      
      if (response.success && response.data) {
        setStats({
          totalAlertsAffecting: response.data.totalAlertsAffecting,
          activeAlertsAffecting: response.data.activeAlertsAffecting,
          myCreatedAlerts: response.data.myCreatedAlerts,
          myResolvedAlerts: response.data.myResolvedAlerts
        })
      } else {
        setError(response.message || 'Failed to fetch alert statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchStats()
    onRefresh?.()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Alert Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
              </div>
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
            <BarChart3 className="h-5 w-5" />
            Alert Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Failed to load statistics</p>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statItems = [
    {
      label: 'Affecting You',
      value: stats?.totalAlertsAffecting || 0,
      icon: AlertTriangle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Total alerts in your area'
    },
    {
      label: 'Currently Active',
      value: stats?.activeAlertsAffecting || 0,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Alerts currently affecting you'
    },
    {
      label: 'Created by You',
      value: stats?.myCreatedAlerts || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Alerts you have reported'
    },
    {
      label: 'Resolved',
      value: stats?.myResolvedAlerts || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Your resolved alerts'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Alert Statistics
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={index} className="text-center">
                <div className={`${item.bgColor} rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {item.value}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.description}
                </div>
              </div>
            )
          })}
        </div>

        {stats && stats.myCreatedAlerts > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Resolution Rate:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {Math.round((stats.myResolvedAlerts / stats.myCreatedAlerts) * 100)}%
                </span>
                <Badge variant="secondary" className="text-xs">
                  {stats.myResolvedAlerts}/{stats.myCreatedAlerts}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
