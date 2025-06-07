// API functions for parking violation analytics and reporting
import { ApiResponse } from '@/types/api'
import { tokenUtils } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = tokenUtils.getAccessToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  
  return data
}

// Analytics Types
export interface ViolationAnalytics {
  overview: {
    totalViolations: number
    totalFines: number
    totalCollected: number
    totalPending: number
    collectionRate: number
    averageResolutionTime: number
    activeViolations: number
    resolvedViolations: number
  }
  trends: {
    daily: Array<{
      date: string
      violations: number
      fines: number
      collected: number
    }>
    weekly: Array<{
      week: string
      violations: number
      fines: number
      collected: number
    }>
    monthly: Array<{
      month: string
      violations: number
      fines: number
      collected: number
      resolutionRate: number
    }>
    yearly: Array<{
      year: string
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
  topViolators: Array<{
    residentId: string
    flatNumber: string
    building?: string
    name: string
    violations: number
    totalFines: number
    paidFines: number
    unpaidFines: number
  }>
  performance: {
    resolutionTimes: {
      average: number
      median: number
      fastest: number
      slowest: number
    }
    collectionMetrics: {
      totalIssued: number
      totalCollected: number
      totalPending: number
      totalOverdue: number
      collectionRate: number
      overdueRate: number
    }
    staffPerformance: Array<{
      adminId: string
      adminName: string
      reviewsCompleted: number
      averageResolutionTime: number
      approvalRate: number
      rejectionRate: number
    }>
  }
}

export interface DashboardStats {
  todayStats: {
    newViolations: number
    reviewsCompleted: number
    finesCollected: number
    collectionAmount: number
  }
  weekStats: {
    newViolations: number
    reviewsCompleted: number
    finesCollected: number
    collectionAmount: number
  }
  monthStats: {
    newViolations: number
    reviewsCompleted: number
    finesCollected: number
    collectionAmount: number
  }
  pendingActions: {
    pendingReviews: number
    overduePayments: number
    escalatedViolations: number
    pendingAppeals: number
  }
  recentActivity: Array<{
    id: string
    type: 'violation_reported' | 'violation_reviewed' | 'fine_paid' | 'appeal_submitted'
    description: string
    timestamp: string
    severity?: string
    amount?: number
  }>
}

export interface ComplianceReport {
  period: {
    from: string
    to: string
  }
  summary: {
    totalViolations: number
    resolvedViolations: number
    pendingViolations: number
    resolutionRate: number
    averageResolutionTime: number
    totalFinesIssued: number
    totalFinesCollected: number
    collectionRate: number
  }
  categoryBreakdown: Array<{
    category: string
    violations: number
    resolved: number
    resolutionRate: number
    averageResolutionTime: number
    totalFines: number
    collectedFines: number
  }>
  buildingPerformance: Array<{
    building: string
    violations: number
    resolved: number
    resolutionRate: number
    complianceScore: number
  }>
  repeatOffenders: Array<{
    flatNumber: string
    building?: string
    violations: number
    totalFines: number
    complianceIssues: string[]
  }>
  trends: {
    violationTrend: 'increasing' | 'decreasing' | 'stable'
    resolutionTrend: 'improving' | 'declining' | 'stable'
    collectionTrend: 'improving' | 'declining' | 'stable'
  }
  recommendations: string[]
}

export interface AnalyticsFilters {
  dateFrom?: string
  dateTo?: string
  building?: string
  category?: string
  severity?: string
  status?: string
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

// Get comprehensive violation analytics
export const getViolationAnalytics = async (filters?: AnalyticsFilters): Promise<ApiResponse<ViolationAnalytics>> => {
  const params = new URLSearchParams()
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/analytics?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/dashboard-stats`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get compliance report
export const getComplianceReport = async (
  period: {
    from: string
    to: string
  },
  filters?: {
    building?: string
    includeRecommendations?: boolean
  }
): Promise<ApiResponse<ComplianceReport>> => {
  const params = new URLSearchParams()
  params.append('from', period.from)
  params.append('to', period.to)
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/compliance-report?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get trend analysis
export const getTrendAnalysis = async (
  metric: 'violations' | 'fines' | 'collection' | 'resolution_time',
  period: 'week' | 'month' | 'quarter' | 'year',
  comparison?: 'previous_period' | 'same_period_last_year'
): Promise<ApiResponse<{
  current: Array<{
    period: string
    value: number
    change?: number
    changePercentage?: number
  }>
  comparison?: Array<{
    period: string
    value: number
  }>
  summary: {
    total: number
    average: number
    trend: 'increasing' | 'decreasing' | 'stable'
    changeFromPrevious: number
    changePercentage: number
  }
}>> => {
  const params = new URLSearchParams()
  params.append('metric', metric)
  params.append('period', period)
  
  if (comparison) {
    params.append('comparison', comparison)
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/trend-analysis?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get real-time metrics
export const getRealTimeMetrics = async (): Promise<ApiResponse<{
  activeUsers: number
  pendingReviews: number
  overduePayments: number
  todayViolations: number
  todayResolutions: number
  todayCollections: number
  systemHealth: {
    apiResponseTime: number
    databaseConnections: number
    errorRate: number
    uptime: number
  }
  alerts: Array<{
    type: 'high_violations' | 'overdue_reviews' | 'system_issue'
    message: string
    severity: 'low' | 'medium' | 'high'
    timestamp: string
  }>
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/real-time-metrics`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get location analytics
export const getLocationAnalytics = async (filters?: {
  building?: string
  area?: string
  dateFrom?: string
  dateTo?: string
}): Promise<ApiResponse<{
  hotspots: Array<{
    location: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    violations: number
    severity: 'low' | 'medium' | 'high'
    mostCommonViolation: string
    timePattern: Array<{
      hour: number
      violations: number
    }>
  }>
  buildingComparison: Array<{
    building: string
    violations: number
    violationsPerResident: number
    complianceScore: number
    improvementTrend: 'improving' | 'declining' | 'stable'
  }>
  areaDistribution: Array<{
    area: string
    violations: number
    percentage: number
    riskLevel: 'low' | 'medium' | 'high'
  }>
}>> => {
  const params = new URLSearchParams()
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/location-analytics?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get resident behavior analytics
export const getResidentBehaviorAnalytics = async (filters?: {
  building?: string
  dateFrom?: string
  dateTo?: string
}): Promise<ApiResponse<{
  segments: Array<{
    segment: 'compliant' | 'occasional_offender' | 'repeat_offender' | 'problematic'
    count: number
    percentage: number
    averageViolations: number
    averageFines: number
    characteristics: string[]
  }>
  repeatOffenders: Array<{
    residentId: string
    flatNumber: string
    building?: string
    violations: number
    finesOwed: number
    riskScore: number
    pattern: string
    lastViolation: string
  }>
  complianceTrends: Array<{
    month: string
    compliantResidents: number
    violatingResidents: number
    complianceRate: number
  }>
  interventionRecommendations: Array<{
    type: 'education' | 'warning' | 'fine_increase' | 'restriction'
    targetSegment: string
    expectedImpact: string
    priority: 'low' | 'medium' | 'high'
  }>
}>> => {
  const params = new URLSearchParams()
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/resident-behavior?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Export analytics report
export const exportAnalyticsReport = async (
  reportType: 'comprehensive' | 'compliance' | 'financial' | 'operational',
  filters?: AnalyticsFilters & {
    format?: 'pdf' | 'excel' | 'csv'
    includeCharts?: boolean
    includeRecommendations?: boolean
  }
): Promise<Blob> => {
  const params = new URLSearchParams()
  params.append('reportType', reportType)
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/analytics/export?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  if (!response.ok) {
    throw new Error('Export failed')
  }
  
  return response.blob()
}

// Get custom query analytics
export const getCustomAnalytics = async (query: {
  metrics: string[]
  dimensions: string[]
  filters?: Record<string, any>
  dateRange: {
    from: string
    to: string
  }
  groupBy?: string
  orderBy?: string
}): Promise<ApiResponse<{
  data: Array<Record<string, any>>
  summary: Record<string, number>
  metadata: {
    totalRows: number
    queryTime: number
    cacheHit: boolean
  }
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/analytics/custom`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(query)
    }
  )
  
  return handleResponse(response)
}

// Utility functions for analytics
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatDuration = (hours: number): string => {
  if (hours < 24) {
    return `${Math.round(hours)} hours`
  } else {
    const days = Math.round(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }
}

export const getMetricColor = (metric: string, value: number, benchmark?: number): string => {
  const colors = {
    good: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444'
  }
  
  if (!benchmark) return colors.good
  
  const ratio = value / benchmark
  
  switch (metric) {
    case 'collection_rate':
    case 'resolution_rate':
      return ratio >= 0.8 ? colors.good : ratio >= 0.6 ? colors.warning : colors.danger
    case 'response_time':
    case 'overdue_rate':
      return ratio <= 1.2 ? colors.good : ratio <= 1.5 ? colors.warning : colors.danger
    default:
      return colors.good
  }
}
