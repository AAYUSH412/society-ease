// API functions for admin-specific parking violation actions
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

// Admin Action Types
export interface AdminAction {
  _id: string
  actionId: string
  type: 'review' | 'fine_issue' | 'waiver' | 'escalation' | 'bulk_operation' | 'system_config'
  performedBy: {
    adminId: string
    name: string
    role: string
  }
  targetEntity: {
    type: 'violation' | 'fine' | 'category' | 'resident' | 'system'
    id: string
    description: string
  }
  details: {
    action: string
    previousValue?: any
    newValue?: any
    reason?: string
    notes?: string
  }
  timestamp: string
  ipAddress?: string
  userAgent?: string
  result: 'success' | 'failed' | 'partial'
  affectedCount?: number
  duration?: number
}

export interface BulkActionRequest {
  action: 'approve' | 'reject' | 'dismiss' | 'issue_fine' | 'waive_fine' | 'send_reminder'
  targetIds: string[]
  targetType: 'violations' | 'fines'
  reason?: string
  notes?: string
  actionData?: Record<string, any>
}

export interface BulkActionResult {
  requestId: string
  totalRequested: number
  successful: number
  failed: number
  status: 'completed' | 'in_progress' | 'failed'
  results: Array<{
    id: string
    status: 'success' | 'failed'
    error?: string
    result?: any
  }>
  startedAt: string
  completedAt?: string
  performedBy: string
}

export interface AdminNotification {
  _id: string
  type: 'violation_pending' | 'payment_overdue' | 'system_alert' | 'policy_update'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'dismissed'
  targetAdmin?: string
  relatedEntity?: {
    type: string
    id: string
  }
  actionRequired?: boolean
  expiresAt?: string
  createdAt: string
}

export interface SystemSettings {
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    overdueReminderDays: number[]
    escalationThresholds: {
      pendingReviewDays: number
      overduePaymentDays: number
    }
  }
  workflow: {
    autoApprovalEnabled: boolean
    autoApprovalCriteria: {
      photoEvidence: boolean
      withinTimeLimit: boolean
      reporterCredibility: number
    }
    bulkActionLimits: {
      maxViolationsPerBatch: number
      maxFinesPerBatch: number
    }
  }
  fineSettings: {
    defaultLateFeePercentage: number
    maxLateFeeAmount: number
    gracePeriodDays: number
    autoEscalationEnabled: boolean
  }
  security: {
    sessionTimeoutMinutes: number
    requireReasonForDismissal: boolean
    auditLogRetentionDays: number
  }
}

// Get admin action history
export const getAdminActionHistory = async (filters?: {
  adminId?: string
  actionType?: string
  targetType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{
  actions: AdminAction[]
  pagination: {
    currentPage: number
    totalPages: number
    totalActions: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalActions: number
    actionsByType: Record<string, number>
    actionsByAdmin: Array<{
      adminId: string
      adminName: string
      actionCount: number
    }>
  }
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
    `${API_BASE}/admin/parking/violations/actions/history?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Perform bulk action
export const performBulkAction = async (bulkRequest: BulkActionRequest): Promise<ApiResponse<{
  requestId: string
  status: 'queued' | 'processing'
  estimatedDuration: number
  message: string
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/actions/bulk`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bulkRequest)
    }
  )
  
  return handleResponse(response)
}

// Get bulk action status
export const getBulkActionStatus = async (requestId: string): Promise<ApiResponse<BulkActionResult>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/actions/bulk/${requestId}/status`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Cancel bulk action
export const cancelBulkAction = async (requestId: string): Promise<ApiResponse<{
  cancelled: boolean
  message: string
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/actions/bulk/${requestId}/cancel`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get admin notifications
export const getAdminNotifications = async (filters?: {
  status?: 'unread' | 'read' | 'dismissed'
  type?: string
  priority?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{
  notifications: AdminNotification[]
  pagination: {
    currentPage: number
    totalPages: number
    totalNotifications: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    unreadCount: number
    urgentCount: number
    actionRequiredCount: number
  }
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
    `${API_BASE}/admin/parking/violations/notifications?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse<AdminNotification>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/notifications/${notificationId}/read`,
    {
      method: 'PUT',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Dismiss notification
export const dismissNotification = async (notificationId: string): Promise<ApiResponse<AdminNotification>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/notifications/${notificationId}/dismiss`,
    {
      method: 'PUT',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Bulk notification actions
export const bulkNotificationAction = async (action: {
  type: 'mark_read' | 'dismiss' | 'delete'
  notificationIds: string[]
}): Promise<ApiResponse<{
  processed: number
  successful: number
  failed: number
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/notifications/bulk`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(action)
    }
  )
  
  return handleResponse(response)
}

// Get system settings
export const getSystemSettings = async (): Promise<ApiResponse<SystemSettings>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/settings`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Update system settings
export const updateSystemSettings = async (
  settingsUpdate: Partial<SystemSettings>
): Promise<ApiResponse<SystemSettings>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/settings`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsUpdate)
    }
  )
  
  return handleResponse(response)
}

// Generate admin report
export const generateAdminReport = async (reportConfig: {
  type: 'audit' | 'performance' | 'compliance' | 'financial'
  period: {
    from: string
    to: string
  }
  format: 'pdf' | 'excel' | 'csv'
  includeDetails?: boolean
  filters?: Record<string, any>
}): Promise<Blob> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/reports/generate`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportConfig)
    }
  )
  
  if (!response.ok) {
    throw new Error('Report generation failed')
  }
  
  return response.blob()
}

// Get admin performance metrics
export const getAdminPerformanceMetrics = async (
  adminId?: string,
  period?: {
    from: string
    to: string
  }
): Promise<ApiResponse<{
  overall: {
    totalActions: number
    averageResponseTime: number
    resolutionRate: number
    accuracyScore: number
  }
  breakdown: {
    violationReviews: {
      total: number
      approved: number
      rejected: number
      averageTime: number
    }
    fineManagement: {
      finesIssued: number
      waivers: number
      collections: number
    }
    bulkOperations: {
      operationsPerformed: number
      successRate: number
      averageSize: number
    }
  }
  trends: Array<{
    date: string
    actions: number
    responseTime: number
    resolutionRate: number
  }>
  ranking: {
    position: number
    totalAdmins: number
    scoreComparison: number
  }
}>> => {
  const params = new URLSearchParams()
  
  if (adminId) params.append('adminId', adminId)
  if (period) {
    params.append('from', period.from)
    params.append('to', period.to)
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/performance?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Emergency actions
export const performEmergencyAction = async (emergencyAction: {
  type: 'bulk_dismiss' | 'system_reset' | 'mass_notification'
  reason: string
  authorization: string
  targetCriteria?: Record<string, any>
  message?: string
}): Promise<ApiResponse<{
  actionId: string
  status: 'executed' | 'queued'
  affectedCount: number
  message: string
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/emergency-action`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(emergencyAction)
    }
  )
  
  return handleResponse(response)
}

// Audit trail
export const getAuditTrail = async (filters?: {
  entityType?: string
  entityId?: string
  actionType?: string
  adminId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{
  auditEntries: Array<{
    id: string
    timestamp: string
    adminId: string
    adminName: string
    action: string
    entityType: string
    entityId: string
    changes: Record<string, any>
    ipAddress: string
    userAgent: string
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalEntries: number
    hasNext: boolean
    hasPrev: boolean
  }
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
    `${API_BASE}/admin/parking/violations/audit-trail?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Workflow management
export const updateWorkflowRule = async (ruleUpdate: {
  ruleId: string
  conditions?: Record<string, any>
  actions?: Record<string, any>
  enabled?: boolean
}): Promise<ApiResponse<{
  rule: any
  affectedViolations: number
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/workflow/rules/${ruleUpdate.ruleId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(ruleUpdate)
    }
  )
  
  return handleResponse(response)
}

// System health check
export const performSystemHealthCheck = async (): Promise<ApiResponse<{
  status: 'healthy' | 'warning' | 'critical'
  checks: Array<{
    component: string
    status: 'pass' | 'warning' | 'fail'
    responseTime?: number
    message?: string
  }>
  summary: {
    totalChecks: number
    passed: number
    warnings: number
    failed: number
  }
  recommendations: string[]
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/system/health`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Utility functions
export const formatActionType = (actionType: string): string => {
  const typeMap = {
    'review': 'Violation Review',
    'fine_issue': 'Fine Issued',
    'waiver': 'Fine Waived',
    'escalation': 'Escalated',
    'bulk_operation': 'Bulk Operation',
    'system_config': 'System Configuration'
  }
  return typeMap[actionType as keyof typeof typeMap] || actionType
}

export const getActionIcon = (actionType: string): string => {
  const iconMap = {
    'review': '👁️',
    'fine_issue': '💰',
    'waiver': '❌',
    'escalation': '⬆️',
    'bulk_operation': '📦',
    'system_config': '⚙️'
  }
  return iconMap[actionType as keyof typeof iconMap] || '📝'
}

export const getNotificationColor = (priority: string): string => {
  const colorMap = {
    'low': '#22c55e',
    'medium': '#f59e0b',
    'high': '#f97316',
    'urgent': '#ef4444'
  }
  return colorMap[priority as keyof typeof colorMap] || '#6b7280'
}
