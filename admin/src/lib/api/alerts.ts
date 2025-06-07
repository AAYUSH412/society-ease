// API utility functions for alert operations
import { ApiResponse, tokenUtils } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Types matching backend Alert model exactly
export interface Alert {
  _id: string
  alertId: string
  title: string
  description: string
  type: 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
  status: 'active' | 'resolved' | 'scheduled' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdDate: string
  startTime: string
  estimatedResolutionTime: string
  actualResolutionTime?: string
  scheduledTime?: string
  createdBy: {
    userId: string
    userRole: 'admin' | 'resident' | 'super_admin'
    userName: string
    userContact: {
      email?: string
      phone?: string
    }
  }
  visibility: {
    scope: 'all' | 'specific_buildings' | 'specific_flats' | 'specific_areas'
    affectedAreas: {
      buildings?: string[]
      flats?: Array<{
        flatNumber: string
        building: string
      }>
      areas?: string[]
    }
    societyName: string
  }
  updates: Array<{
    updateId: string
    message: string
    updatedBy: {
      userId: string
      userName: string
      userRole: string
    }
    timestamp: string
    updateType: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general'
    attachments?: Array<{
      fileName: string
      fileUrl: string
      fileType: string
      uploadedAt: string
    }>
  }>
  tags?: string[]
  escalation?: {
    isEscalated: boolean
    escalatedAt?: string
    escalatedBy?: string
    escalationReason?: string
    escalationLevel: number
  }
  resolution?: {
    resolvedBy?: {
      userId: string
      userName: string
      userRole: string
    }
    resolutionNotes?: string
    resolutionProof?: Array<{
      fileName: string
      fileUrl: string
      fileType: string
      uploadedAt: string
    }>
  }
  isActive: boolean
  autoClose?: {
    enabled: boolean
    afterHours?: number
  }
  createdAt: string
  updatedAt: string
}

export interface AlertStats {
  total: number
  active: number
  resolved: number
  scheduled: number
  cancelled: number
  byType: Record<string, number>
  byPriority: Record<string, number>
  avgResolutionTime: number
  todayCreated: number
  overdue: number
}

export interface AlertUpdate {
  message: string
  updateType?: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general'
  updatedBy: {
    userId: string
    userName: string
    userRole: string
  }
  attachments?: Array<{
    fileName: string
    fileUrl: string
    fileType: string
  }>
}

// Request types for creating alerts (matching backend expectations)
export interface CreateAlertRequest {
  title: string
  description: string
  type: 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  estimatedResolutionTime: string
  scheduledTime?: string
  visibility?: {
    scope?: 'all' | 'specific_buildings' | 'specific_flats' | 'specific_areas'
    affectedAreas?: {
      buildings?: string[]
      flats?: Array<{
        flatNumber: string
        building: string
      }>
      areas?: string[]
    }
  }
  tags?: string[]
  autoClose?: {
    enabled: boolean
    afterHours?: number
  }
}

export interface UpdateAlertRequest {
  title?: string
  description?: string
  type?: 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'active' | 'resolved' | 'scheduled' | 'cancelled'
  estimatedResolutionTime?: string
  scheduledTime?: string
  visibility?: {
    scope?: 'all' | 'specific_buildings' | 'specific_flats' | 'specific_areas'
    affectedAreas?: {
      buildings?: string[]
      flats?: Array<{
        flatNumber: string
        building: string
      }>
      areas?: string[]
    }
  }
  tags?: string[]
  isActive?: boolean
  resolution?: {
    resolvedBy?: {
      userId: string
      userName: string
      userRole: string
    }
    resolutionNotes?: string
    resolutionProof?: Array<{
      fileName: string
      fileUrl: string
      fileType: string
    }>
  }
}

export interface EscalateAlertRequest {
  escalationReason: string
  escalationLevel?: number
}

export interface ResolveAlertRequest {
  resolutionNotes: string
  resolutionProof?: Array<{
    fileName: string
    fileUrl: string
    fileType: string
  }>
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = tokenUtils.getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred')
  }
  
  return data
}

// Alert API functions

// Response interface for paginated alerts
export interface AlertsResponse {
  alerts: Alert[]
  pagination: {
    currentPage: number
    totalPages: number
    totalAlerts: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Get all alerts with filtering
export const getAlerts = async (params?: {
  page?: number
  limit?: number
  status?: string
  type?: string
  priority?: string
  search?: string
  assignedTo?: string
  createdBy?: string
}): Promise<ApiResponse<AlertsResponse>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.type) queryParams.append('type', params.type)
  if (params?.priority) queryParams.append('priority', params.priority)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo)
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)
  
  const response = await fetch(
    `${API_BASE}/alerts?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )
  
  return handleResponse(response)
}

// Get alert statistics
export const getAlertStats = async (): Promise<ApiResponse<AlertStats>> => {
  const response = await fetch(`${API_BASE}/alerts/statistics`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<AlertStats>(response)
}

// Alias for backward compatibility
export const getAlertStatistics = getAlertStats

// Get alert details
export const getAlert = async (alertId: string): Promise<ApiResponse<Alert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<Alert>(response)
}

// Create new alert
export const createAlert = async (alertData: CreateAlertRequest): Promise<ApiResponse<Alert>> => {
  const response = await fetch(`${API_BASE}/alerts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(alertData),
  })
  
  return handleResponse<Alert>(response)
}

// Update alert
export const updateAlert = async (alertId: string, alertData: UpdateAlertRequest): Promise<ApiResponse<Alert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(alertData),
  })
  
  return handleResponse<Alert>(response)
}

// Add alert update
export const addAlertUpdate = async (alertId: string, updateData: AlertUpdate): Promise<ApiResponse<Alert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}/updates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  })
  
  return handleResponse<Alert>(response)
}

// Escalate alert
export const escalateAlert = async (alertId: string, escalationData: EscalateAlertRequest): Promise<ApiResponse<Alert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}/escalate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(escalationData),
  })
  
  return handleResponse<Alert>(response)
}

// Resolve alert
export const resolveAlert = async (alertId: string, resolutionData: ResolveAlertRequest): Promise<ApiResponse<Alert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resolutionData),
  })
  
  return handleResponse<Alert>(response)
}

// Delete alert
export const deleteAlert = async (alertId: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<void>(response)
}

// Get active alerts for dashboard
export const getActiveAlerts = async (): Promise<ApiResponse<Alert[]>> => {
  const response = await fetch(`${API_BASE}/alerts/active`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<Alert[]>(response)
}

// Bulk operations
export interface BulkUpdateRequest {
  alertIds: string[]
  updates: {
    status?: 'active' | 'resolved' | 'scheduled' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }
}

export const bulkUpdateAlerts = async (bulkData: BulkUpdateRequest): Promise<ApiResponse<{
  updated: number
  failed: number
  results: Array<{
    alertId: string
    status: 'success' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(`${API_BASE}/alerts/bulk-update`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bulkData),
  })
  
  return handleResponse(response)
}

export const bulkDeleteAlerts = async (alertIds: string[]): Promise<ApiResponse<{
  deleted: number
  failed: number
  results: Array<{
    alertId: string
    status: 'success' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(`${API_BASE}/alerts/bulk-delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ alertIds }),
  })
  
  return handleResponse(response)
}

// Utility functions
export const getAlertTypeColor = (type: string): string => {
  const colors = {
    water: 'bg-blue-100 text-blue-800 border-blue-200',
    electricity: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gas: 'bg-orange-100 text-orange-800 border-orange-200',
    maintenance: 'bg-purple-100 text-purple-800 border-purple-200',
    security: 'bg-red-100 text-red-800 border-red-200',
    internet: 'bg-green-100 text-green-800 border-green-200',
    general: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[type as keyof typeof colors] || colors.general
}

export const getAlertPriorityColor = (priority: string): string => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[priority as keyof typeof colors] || colors.low
}

export const getAlertStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[status as keyof typeof colors] || colors.active
}

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateTimeDifference = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  }
}
