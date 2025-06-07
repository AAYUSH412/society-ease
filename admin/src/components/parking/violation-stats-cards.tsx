"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react"

interface ViolationStatsCardsProps {
  overview: {
    totalViolations: number
    pendingReview: number
    resolvedToday: number
    totalFines: number
    averageResolutionTime: number
    mostCommonViolation: string
    activeViolators: number
    monthlyTrend: number
  } | null
}

export function ViolationStatsCards({ overview }: ViolationStatsCardsProps) {
  if (!overview) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    }
    return `${Math.round(hours / 24)}d`
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    }
    return <TrendingUp className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-red-600"
    if (trend < 0) return "text-green-600"
    return "text-muted-foreground"
  }

  const statsCards = [
    {
      title: "Total Violations",
      value: overview.totalViolations,
      description: "All time violations",
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      trend: overview.monthlyTrend,
      showTrend: true,
    },
    {
      title: "Pending Review",
      value: overview.pendingReview,
      description: "Awaiting action",
      icon: Clock,
      iconColor: "text-blue-500",
      urgent: overview.pendingReview > 10,
    },
    {
      title: "Resolved Today",
      value: overview.resolvedToday,
      description: "Completed today",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    {
      title: "Total Fines",
      value: formatCurrency(overview.totalFines),
      description: "Outstanding amount",
      icon: DollarSign,
      iconColor: "text-purple-500",
      isAmount: true,
    },
    {
      title: "Avg Resolution Time",
      value: formatTime(overview.averageResolutionTime),
      description: "Time to resolve",
      icon: Calendar,
      iconColor: "text-indigo-500",
      isTime: true,
    },
    {
      title: "Active Violators",
      value: overview.activeViolators,
      description: "Unique residents",
      icon: Users,
      iconColor: "text-cyan-500",
    },
    {
      title: "Most Common",
      value: overview.mostCommonViolation,
      description: "Violation type",
      icon: AlertTriangle,
      iconColor: "text-rose-500",
      isText: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.slice(0, 4).map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <Card key={index} className={stat.urgent ? "border-red-200 dark:border-red-800" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="flex items-center space-x-1">
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                {stat.showTrend && stat.trend !== undefined && (
                  getTrendIcon(stat.trend)
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.urgent ? "text-red-600" : ""}`}>
                {stat.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.showTrend && stat.trend !== undefined && (
                  <Badge variant="outline" className={`text-xs ${getTrendColor(stat.trend)}`}>
                    {stat.trend > 0 ? "+" : ""}{stat.trend}%
                  </Badge>
                )}
              </div>
              {stat.urgent && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Needs Attention
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Extended Stats - Second Row */}
      <div className="md:col-span-2 lg:col-span-4">
        <div className="grid gap-4 md:grid-cols-3">
          {statsCards.slice(4).map((stat, index) => {
            const Icon = stat.icon
            
            return (
              <Card key={index + 4}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-xl font-bold ${stat.isText ? "text-base" : ""}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="md:col-span-2 lg:col-span-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-dashed border-2 hover:border-solid hover:bg-muted/50 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Report New Violation</p>
                <p className="text-xs text-muted-foreground">Quick violation entry</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 hover:border-solid hover:bg-muted/50 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Bulk Review</p>
                <p className="text-xs text-muted-foreground">Process multiple violations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
