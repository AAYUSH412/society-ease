'use client'

import React, { useState, useEffect } from 'react'
import { AlertStatistics, getAlertStatistics } from '@/lib/api/alerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowUp, 
  Target,
  Timer,
  BarChart3
} from 'lucide-react'

interface AlertStatsProps {
  className?: string
  compact?: boolean
}

export const AlertStats: React.FC<AlertStatsProps> = ({ 
  className = '',
  compact = false 
}) => {
  const [stats, setStats] = useState<AlertStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getAlertStatistics()
        if (response.success && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('Error loading alert statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total Alerts',
      value: stats.total,
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Escalated',
      value: stats.escalated,
      icon: <ArrowUp className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  if (compact) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.borderColor} border`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.borderColor} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4" />
              Today&apos;s Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCreated}</div>
            <p className="text-sm text-muted-foreground">
              New alerts created today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Pending Escalation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEscalation}</div>
            <p className="text-sm text-muted-foreground">
              Alerts requiring escalation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Avg Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgResolutionTime ? `${Math.round(stats.avgResolutionTime)}h` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Average time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Types Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alerts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{count}</div>
                    <div className="w-20 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{
                          width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alerts by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byPriority).map(([priority, count]) => {
                const priorityColors = {
                  critical: 'bg-red-500',
                  high: 'bg-orange-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-green-500'
                }
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div
                          className={`h-full rounded ${priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500'}`}
                          style={{
                            width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AlertStats
