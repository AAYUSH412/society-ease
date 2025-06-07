"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users } from "lucide-react"

interface ReviewStatsData {
  totalPending: number
  approvedToday: number
  rejectedToday: number
  averageReviewTime: number
  pendingByPriority: {
    critical: number
    high: number
    medium: number
    low: number
  }
  reviewerWorkload: Array<{
    id: string
    name: string
    assigned: number
    completed: number
  }>
  urgentCount: number
  overdueCount: number
}

interface ReviewStatsProps {
  stats: ReviewStatsData | null
  loading?: boolean
}

export function ReviewStats({ stats, loading = false }: ReviewStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getPriorityColor = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.urgentCount} urgent, {stats.overdueCount} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedToday}</div>
            <p className="text-xs text-muted-foreground">
              -5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(stats.averageReviewTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              -8% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              By Priority Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.pendingByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(priority)}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-20">
                    <Progress 
                      value={(count / stats.totalPending) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reviewer Workload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.reviewerWorkload.slice(0, 5).map((reviewer) => (
              <div key={reviewer.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{reviewer.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {reviewer.completed}/{reviewer.assigned}
                  </span>
                </div>
                <Progress 
                  value={reviewer.assigned > 0 ? (reviewer.completed / reviewer.assigned) * 100 : 0}
                  className="h-2"
                />
              </div>
            ))}
            {stats.reviewerWorkload.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active reviewers
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
