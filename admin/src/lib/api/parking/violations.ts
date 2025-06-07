// API functions for parking violation management
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

// Violation Types
export interface ParkingViolation {
  _id: string
  violationId: string
  reportedBy: {
    userId: string
    flatNumber: string
    building?: string
    name: string
  }
  violatedBy: {
    flatNumber: string
    building?: string
    vehicleNumber?: string
    ownerName?: string
  }
  category: {
    _id: string
    name: string
    code: string
    baseFineAmount: number
    severity: 'low' | 'medium' | 'high' | 'critical'
  }
  location: {
    area: string
    specificLocation?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  incidentDateTime: string
  description: string
  evidence: {
    photos: Array<{
      photoId: string
      url: string
      thumbnailUrl?: string
      uploadedAt: string
      description?: string
    }>
    additionalEvidence?: string
  }
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'dismissed'
  adminReview?: {
    reviewedBy: string
    reviewedAt: string
    decision: 'approved' | 'rejected'
    notes?: string
    fineIssued?: boolean
    fineAmount?: number
  }
  appeal?: {
    submittedAt: string
    reason: string
    status: 'pending' | 'accepted' | 'rejected'
    reviewedAt?: string
    adminNotes?: string
  }
  timeline: Array<{
    action: string
    performedBy: string
    timestamp: string
    notes?: string
  }>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
}

export interface ViolationFilters {
  page?: number
  limit?: number
  status?: string
  category?: string
  severity?: string
  priority?: string
  reportedBy?: string
  violatedBy?: string
  dateFrom?: string
  dateTo?: string
  location?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ViolationStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  resolved: number
  dismissed: number
  todayReported: number
  averageResolutionTime: number
}

// Get all violations with filters
export const getAllViolations = async (filters?: ViolationFilters): Promise<ApiResponse<{
  violations: ParkingViolation[]
  pagination: {
    currentPage: number
    totalPages: number
    totalViolations: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: ViolationStats
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
    `${API_BASE}/admin/parking/violations/all?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get pending violations for review
export const getPendingViolations = async (filters?: ViolationFilters): Promise<ApiResponse<{
  violations: ParkingViolation[]
  pagination: {
    currentPage: number
    totalPages: number
    totalViolations: number
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
    `${API_BASE}/admin/parking/violations/pending?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get violation details by ID
export const getViolationDetails = async (violationId: string): Promise<ApiResponse<{
  violation: ParkingViolation
  relatedViolations: ParkingViolation[]
  residentHistory: {
    totalViolations: number
    recentViolations: ParkingViolation[]
  }
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/details/${violationId}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Review a violation
export const reviewViolation = async (
  violationId: string,
  reviewData: {
    decision: 'approved' | 'rejected'
    notes?: string
    fineAmount?: number
    adminNotes?: string
  }
): Promise<ApiResponse<ParkingViolation>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/review/${violationId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    }
  )
  
  return handleResponse(response)
}

// Bulk review violations
export const bulkReviewViolations = async (bulkData: {
  violationIds: string[]
  action: 'approve' | 'reject' | 'dismiss'
  notes?: string
  fineAmount?: number
}): Promise<ApiResponse<{
  processed: number
  successful: number
  failed: number
  results: Array<{
    violationId: string
    status: 'success' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/bulk-review`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bulkData)
    }
  )
  
  return handleResponse(response)
}

// Update violation status
export const updateViolationStatus = async (
  violationId: string,
  status: ParkingViolation['status'],
  notes?: string
): Promise<ApiResponse<ParkingViolation>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/${violationId}/status`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    }
  )
  
  return handleResponse(response)
}

// Review appeal
export const reviewAppeal = async (
  violationId: string,
  appealData: {
    decision: 'accepted' | 'rejected'
    adminNotes?: string
  }
): Promise<ApiResponse<ParkingViolation>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/${violationId}/appeal/review`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appealData)
    }
  )
  
  return handleResponse(response)
}

// Get resident violation history
export const getResidentViolationHistory = async (
  residentId: string,
  params?: {
    page?: number
    limit?: number
    status?: string
    dateFrom?: string
    dateTo?: string
  }
): Promise<ApiResponse<{
  violations: ParkingViolation[]
  summary: {
    totalViolations: number
    pendingViolations: number
    resolvedViolations: number
    totalFines: number
    paidFines: number
    averageResolutionTime: number
  }
  pagination: {
    currentPage: number
    totalPages: number
    totalViolations: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/resident/${residentId}/history?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Export violations
export const exportViolations = async (filters?: ViolationFilters & {
  format?: 'csv' | 'excel' | 'pdf'
  includePhotos?: boolean
}): Promise<Blob> => {
  const params = new URLSearchParams()
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/export?${params.toString()}`,
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

// Delete violation
export const deleteViolation = async (violationId: string): Promise<ApiResponse<void>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/${violationId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Add admin note to violation
export const addAdminNote = async (
  violationId: string,
  note: string
): Promise<ApiResponse<ParkingViolation>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/${violationId}/notes`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    }
  )
  
  return handleResponse(response)
}

// Escalate violation
export const escalateViolation = async (
  violationId: string,
  escalationData: {
    reason: string
    escalateTo?: string
    priority: 'high' | 'urgent'
  }
): Promise<ApiResponse<ParkingViolation>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/${violationId}/escalate`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(escalationData)
    }
  )
  
  return handleResponse(response)
}

// Assign violation reviewer
export const assignViolationReviewer = async (
  violationId: string,
  reviewerId: string
): Promise<ApiResponse<ParkingViolation>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/${violationId}/assign-reviewer`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviewerId })
    }
  )
  
  return handleResponse(response)
}
