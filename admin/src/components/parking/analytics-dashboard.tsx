"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  MapPin,
  RefreshCw,
  Download,
  Building
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalViolations: number
    resolvedViolations: number
    pendingViolations: number
    totalFinesAmount: number
    averageResolutionTime: number
    complianceRate: number
    repeatOffenders: number
    monthlyGrowth: number
  }
  trends: {
    monthly: Array<{
      month: string
      violations: number
      fines: number
      collected: number
      resolutionRate: number
    }>
  }
  distributions: {
    byCategory: Array<{
      category: string
      violations: number
      percentage: number
      totalFines: number
      averageFine: number
    }>
    bySeverity: Array<{
      severity: string
      violations: number
      percentage: number
      totalFines: number
    }>
    byStatus: Array<{
      status: string
      violations: number
      percentage: number
    }>
    byLocation: Array<{
      location: string
      violations: number
      percentage: number
      totalFines: number
    }>
    byBuilding: Array<{
      building: string
      violations: number
      percentage: number
      totalFines: number
      collectionRate: number
    }>
  }
}

// Mock data for development
const MOCK_ANALYTICS_DATA: AnalyticsData = {
  overview: {
    totalViolations: 1247,
    resolvedViolations: 892,
    pendingViolations: 355,
    totalFinesAmount: 186500,
    averageResolutionTime: 4.2,
    complianceRate: 71.5,
    repeatOffenders: 34,
    monthlyGrowth: -12.3
  },
  trends: {
    monthly: [
      { month: 'Jan', violations: 120, fines: 18000, collected: 14400, resolutionRate: 80 },
      { month: 'Feb', violations: 95, fines: 14250, collected: 12825, resolutionRate: 90 },
      { month: 'Mar', violations: 140, fines: 21000, collected: 16800, resolutionRate: 80 },
      { month: 'Apr', violations: 110, fines: 16500, collected: 14850, resolutionRate: 90 },
      { month: 'May', violations: 160, fines: 24000, collected: 19200, resolutionRate: 80 },
      { month: 'Jun', violations: 105, fines: 15750, collected: 14175, resolutionRate: 90 }
    ]
  },
  distributions: {
    byCategory: [
      { category: 'Unauthorized Parking', violations: 456, percentage: 36.6, totalFines: 68400, averageFine: 150 },
      { category: 'Visitor Parking Misuse', violations: 298, percentage: 23.9, totalFines: 44700, averageFine: 150 },
      { category: 'Reserved Spot Violation', violations: 267, percentage: 21.4, totalFines: 53400, averageFine: 200 },
      { category: 'Fire Lane Blocking', violations: 156, percentage: 12.5, totalFines: 46800, averageFine: 300 },
      { category: 'Handicap Space Misuse', violations: 70, percentage: 5.6, totalFines: 21000, averageFine: 300 }
    ],
    bySeverity: [
      { severity: 'Low', violations: 623, percentage: 49.9, totalFines: 93450 },
      { severity: 'Medium', violations: 468, percentage: 37.5, totalFines: 70200 },
      { severity: 'High', violations: 156, percentage: 12.5, totalFines: 46800 }
    ],
    byStatus: [
      { status: 'resolved', violations: 892, percentage: 71.5 },
      { status: 'pending', violations: 267, percentage: 21.4 },
      { status: 'under_review', violations: 88, percentage: 7.1 }
    ],
    byLocation: [
      { location: 'Main Parking Lot', violations: 312, percentage: 25.0, totalFines: 46800 },
      { location: 'Visitor Parking', violations: 267, percentage: 21.4, totalFines: 40050 },
      { location: 'Building A Basement', violations: 186, percentage: 14.9, totalFines: 27900 },
      { location: 'Building B Ground', violations: 156, percentage: 12.5, totalFines: 23400 },
      { location: 'Fire Lane Area', violations: 124, percentage: 9.9, totalFines: 37200 },
      { location: 'Other Areas', violations: 202, percentage: 16.2, totalFines: 30300 }
    ],
    byBuilding: [
      { building: 'Tower A', violations: 342, percentage: 27.4, totalFines: 51300, collectionRate: 85.2 },
      { building: 'Tower B', violations: 298, percentage: 23.9, totalFines: 44700, collectionRate: 78.5 },
      { building: 'Tower C', violations: 267, percentage: 21.4, totalFines: 40050, collectionRate: 82.1 },
      { building: 'Common Areas', violations: 218, percentage: 17.5, totalFines: 32700, collectionRate: 91.3 },
      { building: 'Commercial Block', violations: 122, percentage: 9.8, totalFines: 18300, collectionRate: 74.6 }
    ]
  }
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6'
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [activeMetric, setActiveMetric] = useState('violations')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use mock data for now - replace with actual API call when ready
      setAnalytics(MOCK_ANALYTICS_DATA)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? 
      <TrendingUp className="h-4 w-4 text-red-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'violations': return COLORS.primary
      case 'fines': return COLORS.warning
      case 'collected': return COLORS.success
      case 'resolutionRate': return COLORS.info
      default: return COLORS.primary
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            Unable to load analytics data. Please try again later.
          </p>
          <Button onClick={loadAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into parking violations and compliance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalViolations.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(analytics.overview.monthlyGrowth)}
              <span className="ml-1">
                {Math.abs(analytics.overview.monthlyGrowth).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage((analytics.overview.resolvedViolations / analytics.overview.totalViolations) * 100)}
            </div>
            <Progress 
              value={(analytics.overview.resolvedViolations / analytics.overview.totalViolations) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalFinesAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Avg. resolution: {analytics.overview.averageResolutionTime}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.overview.complianceRate)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.repeatOffenders} repeat offenders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Violation Trends</CardTitle>
              <Select value={activeMetric} onValueChange={setActiveMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="violations">Violations</SelectItem>
                  <SelectItem value="fines">Fines Amount</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="resolutionRate">Resolution Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trends.monthly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={getMetricColor(activeMetric)}
                    fill={getMetricColor(activeMetric)}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Violation Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Violations by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.distributions.byCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="violations"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {analytics.distributions.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Violations by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.distributions.bySeverity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="severity" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="violations" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location & Building Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Violation Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Top Violation Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.distributions.byLocation.slice(0, 5).map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{location.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(location.totalFines)} in fines
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{location.violations}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(location.percentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Building Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Building Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.distributions.byBuilding.map((building) => (
                <div key={building.building} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{building.building}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {building.violations} violations
                      </Badge>
                      <Badge className={
                        building.collectionRate >= 80 ? 'bg-green-100 text-green-800' :
                        building.collectionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {formatPercentage(building.collectionRate)} collected
                      </Badge>
                    </div>
                  </div>
                  <Progress value={building.collectionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {analytics.distributions.byStatus.map((status) => {
              const getStatusIcon = (statusName: string) => {
                switch (statusName.toLowerCase()) {
                  case 'resolved': return <CheckCircle className="h-8 w-8 text-green-500" />
                  case 'pending': return <Clock className="h-8 w-8 text-yellow-500" />
                  case 'under_review': return <AlertTriangle className="h-8 w-8 text-blue-500" />
                  default: return <AlertTriangle className="h-8 w-8 text-gray-500" />
                }
              }

              return (
                <div key={status.status} className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-center mb-2">
                    {getStatusIcon(status.status)}
                  </div>
                  <div className="text-2xl font-bold">{status.violations}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status.status.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatPercentage(status.percentage)} of total
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
