// Resident Alert API calls
// This file handles all API calls for resident alert functionality

import { tokenUtils } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Response wrapper interface
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = tokenUtils.getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP error! status: ${response.status}`,
        error: data.error || data.message
      }
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse response',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Types matching backend Alert model for residents
export interface ResidentAlert {
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
    userRole: 'resident'
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
    residentFeedback?: Array<{
      residentId: string
      rating: number
      comment: string
      submittedAt: string
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

// Paginated response for alerts
export interface ResidentAlertsResponse {
  alerts: ResidentAlert[]
  pagination: {
    currentPage: number
    totalPages: number
    totalAlerts: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Request types for creating alerts as a resident
export interface CreateResidentAlertRequest {
  title: string
  description: string
  type: 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
  priority?: 'low' | 'medium' | 'high' // Residents can't create critical alerts
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

// Request types for adding updates
export interface AddAlertUpdateRequest {
  message: string
  updateType?: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general'
  attachments?: Array<{
    fileName: string
    fileUrl: string
    fileType: string
  }>
}

// Request types for escalating alerts
export interface EscalateAlertRequest {
  reason: string
}

// Request types for resolving alerts (only alert creator can resolve)
export interface ResolveAlertRequest {
  resolutionNotes: string
  resolutionProof?: Array<{
    fileName: string
    fileUrl: string
    fileType: string
  }>
}

// Request type for resident feedback
export interface ResidentFeedbackRequest {
  rating: number // 1-5 stars
  comment?: string
}

// Alert filters for residents
export interface ResidentAlertFilters {
  page?: number
  limit?: number
  status?: 'active' | 'resolved' | 'scheduled' | 'cancelled'
  type?: 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  search?: string
  sortBy?: 'createdDate' | 'priority' | 'estimatedResolutionTime'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

// API FUNCTIONS

// Get all alerts visible to resident with filters
export const getResidentAlerts = async (filters: ResidentAlertFilters = {}): Promise<ApiResponse<ResidentAlertsResponse>> => {
  const queryParams = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString())
    }
  })
  
  const response = await fetch(`${API_BASE}/alerts?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<ResidentAlertsResponse>(response)
}

// Get active alerts for resident dashboard
export const getActiveAlertsForResident = async (): Promise<ApiResponse<ResidentAlert[]>> => {
  const response = await fetch(`${API_BASE}/alerts/active`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<ResidentAlert[]>(response)
}

// Get single alert details
export const getResidentAlert = async (alertId: string): Promise<ApiResponse<ResidentAlert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<ResidentAlert>(response)
}

// Create new alert as resident
export const createResidentAlert = async (alertData: CreateResidentAlertRequest): Promise<ApiResponse<ResidentAlert>> => {
  const response = await fetch(`${API_BASE}/alerts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(alertData),
  })
  
  return handleResponse<ResidentAlert>(response)
}

// Add update to alert
export const addAlertUpdate = async (alertId: string, updateData: AddAlertUpdateRequest): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}/updates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  })
  
  return handleResponse(response)
}

// Escalate alert
export const escalateAlert = async (alertId: string, escalationData: EscalateAlertRequest): Promise<ApiResponse<ResidentAlert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}/escalate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(escalationData),
  })
  
  return handleResponse<ResidentAlert>(response)
}

// Resolve alert (only alert creator can resolve)
export const resolveAlert = async (alertId: string, resolutionData: ResolveAlertRequest): Promise<ApiResponse<ResidentAlert>> => {
  const response = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resolutionData),
  })
  
  return handleResponse<ResidentAlert>(response)
}

// Submit feedback for resolved alert (this might be added to backend later)
export const submitAlertFeedback = async (alertId: string, feedbackData: ResidentFeedbackRequest): Promise<ApiResponse<any>> => {
  // Note: This endpoint needs to be implemented in backend
  const response = await fetch(`${API_BASE}/alerts/${alertId}/feedback`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(feedbackData),
  })
  
  return handleResponse(response)
}

// Acknowledge alert (mark as read/acknowledged by resident)
export const acknowledgeAlert = async (alertId: string): Promise<ApiResponse<any>> => {
  // Note: This endpoint needs to be implemented in backend
  const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  
  return handleResponse(response)
}

// Get alert statistics for resident dashboard
export const getResidentAlertStats = async (): Promise<ApiResponse<{
  totalAlertsAffecting: number
  activeAlertsAffecting: number
  myCreatedAlerts: number
  myResolvedAlerts: number
  recentAlerts: ResidentAlert[]
}>> => {
  // This combines multiple API calls to provide dashboard stats
  try {
    const [activeResponse, allResponse] = await Promise.all([
      getActiveAlertsForResident(),
      getResidentAlerts({ limit: 50 })
    ])

    if (!activeResponse.success || !allResponse.success) {
      return {
        success: false,
        message: 'Failed to fetch alert statistics'
      }
    }

    const activeAlerts = activeResponse.data || []
    const allAlerts = allResponse.data?.alerts || []
    
    // Get current user ID from token (you might need to adjust this based on your auth system)
    const token = localStorage.getItem('token')
    let userId = ''
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.userId || payload.id || ''
      } catch (e) {
        console.warn('Could not parse user ID from token')
      }
    }

    const myCreatedAlerts = allAlerts.filter(alert => alert.createdBy.userId === userId)
    const myResolvedAlerts = myCreatedAlerts.filter(alert => alert.status === 'resolved')
    const recentAlerts = allAlerts.slice(0, 5) // Most recent 5 alerts

    return {
      success: true,
      data: {
        totalAlertsAffecting: allAlerts.length,
        activeAlertsAffecting: activeAlerts.length,
        myCreatedAlerts: myCreatedAlerts.length,
        myResolvedAlerts: myResolvedAlerts.length,
        recentAlerts
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to calculate alert statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export default {
  getResidentAlerts,
  getActiveAlertsForResident,
  getResidentAlert,
  createResidentAlert,
  addAlertUpdate,
  escalateAlert,
  resolveAlert,
  submitAlertFeedback,
  acknowledgeAlert,
  getResidentAlertStats
}
