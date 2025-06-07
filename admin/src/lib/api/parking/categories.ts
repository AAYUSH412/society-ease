// API functions for violation category management
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

// Violation Category Types
export interface ViolationCategory {
  _id: string
  name: string
  code: string
  description: string
  baseFineAmount: number
  escalationFine: number
  maxFineAmount?: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  requiresPhotoEvidence: boolean
  requiresWitnessStatement: boolean
  autoApprovalEnabled: boolean
  allowAppeals: boolean
  reportingTimeLimit: number
  resolutionTimeLimit: number
  appealTimeLimit: number
  notifyResident: boolean
  notifyAdmin: boolean
  escalationNotification: boolean
  isActive: boolean
  displayOrder: number
  totalViolations: number
  totalFinesCollected: number
  lastUsed?: string
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  fineRange: string
  averageFinePerViolation: number
  isRecentlyUsed: boolean
}

export interface CategoryFilters {
  page?: number
  limit?: number
  status?: 'active' | 'inactive'
  severity?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CategoryStats {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  totalViolations: number
  totalFinesCollected: number
  averageFineAmount: number
  mostUsedCategory: {
    name: string
    violations: number
  }
  severityDistribution: Array<{
    severity: string
    count: number
    percentage: number
  }>
}

export interface CreateCategoryRequest {
  name: string
  description: string
  baseFineAmount: number
  escalationFine?: number
  maxFineAmount?: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  requiresPhotoEvidence?: boolean
  requiresWitnessStatement?: boolean
  autoApprovalEnabled?: boolean
  allowAppeals?: boolean
  reportingTimeLimit?: number
  resolutionTimeLimit?: number
  appealTimeLimit?: number
  notifyResident?: boolean
  notifyAdmin?: boolean
  escalationNotification?: boolean
  displayOrder?: number
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean
}

// Get all violation categories
export const getCategories = async (filters?: CategoryFilters): Promise<ApiResponse<{
  categories: ViolationCategory[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCategories: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: CategoryStats
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
    `${API_BASE}/violation-categories?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get active categories (for forms/dropdowns)
export const getActiveCategories = async (): Promise<ApiResponse<ViolationCategory[]>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories?status=active&sortBy=displayOrder&sortOrder=asc`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get category by ID
export const getCategoryById = async (categoryId: string): Promise<ApiResponse<{
  category: ViolationCategory
  usageStats: {
    recentViolations: Array<{
      violationId: string
      reportedAt: string
      status: string
      fineAmount: number
    }>
    monthlyUsage: Array<{
      month: string
      violations: number
      finesCollected: number
    }>
  }
}>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/${categoryId}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Create new category
export const createCategory = async (categoryData: CreateCategoryRequest): Promise<ApiResponse<ViolationCategory>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    }
  )
  
  return handleResponse(response)
}

// Update category
export const updateCategory = async (
  categoryId: string,
  categoryData: UpdateCategoryRequest
): Promise<ApiResponse<ViolationCategory>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/${categoryId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    }
  )
  
  return handleResponse(response)
}

// Delete category
export const deleteCategory = async (categoryId: string): Promise<ApiResponse<void>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/${categoryId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Toggle category status (active/inactive)
export const toggleCategoryStatus = async (categoryId: string): Promise<ApiResponse<ViolationCategory>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/${categoryId}/toggle-status`,
    {
      method: 'PUT',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Update categories order (for display ordering)
export const updateCategoriesOrder = async (orderedIds: string[]): Promise<ApiResponse<ViolationCategory[]>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/bulk/update-order`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderedIds })
    }
  )
  
  return handleResponse(response)
}

// Get category statistics
export const getCategoryStats = async (): Promise<ApiResponse<{
  overview: CategoryStats
  categoryPerformance: Array<{
    categoryId: string
    name: string
    violations: number
    finesCollected: number
    averageFine: number
    resolutionRate: number
    appealRate: number
  }>
  trendData: Array<{
    month: string
    categories: Array<{
      name: string
      violations: number
      fines: number
    }>
  }>
}>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/stats/overview`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Search categories
export const searchCategories = async (searchTerm: string): Promise<ApiResponse<ViolationCategory[]>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/search?q=${encodeURIComponent(searchTerm)}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get categories by severity
export const getCategoriesBySeverity = async (severity: string): Promise<ApiResponse<ViolationCategory[]>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories?severity=${severity}&status=active`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get most used categories
export const getMostUsedCategories = async (limit: number = 10): Promise<ApiResponse<ViolationCategory[]>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories?sortBy=totalViolations&sortOrder=desc&limit=${limit}&status=active`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Bulk operations
export const bulkUpdateCategories = async (bulkData: {
  categoryIds: string[]
  action: 'activate' | 'deactivate' | 'delete'
  updateData?: Partial<UpdateCategoryRequest>
}): Promise<ApiResponse<{
  processed: number
  successful: number
  failed: number
  results: Array<{
    categoryId: string
    status: 'success' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/bulk/update`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bulkData)
    }
  )
  
  return handleResponse(response)
}

// Export categories
export const exportCategories = async (format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> => {
  const response = await fetch(
    `${API_BASE}/violation-categories/export?format=${format}`,
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

// Utility functions
export const calculateFineAmount = (category: ViolationCategory, escalationLevel: number = 0): number => {
  let fineAmount = category.baseFineAmount
  
  if (escalationLevel > 0 && category.escalationFine > 0) {
    fineAmount += (category.escalationFine * escalationLevel)
  }
  
  if (category.maxFineAmount && fineAmount > category.maxFineAmount) {
    fineAmount = category.maxFineAmount
  }
  
  return fineAmount
}

export const getCategorySeverityColor = (severity: string): string => {
  const colors = {
    low: '#22c55e',     // green
    medium: '#f59e0b',  // yellow
    high: '#f97316',    // orange
    critical: '#ef4444' // red
  }
  return colors[severity as keyof typeof colors] || '#6b7280'
}

export const formatFineRange = (category: ViolationCategory): string => {
  if (category.maxFineAmount && category.maxFineAmount > category.baseFineAmount) {
    return `₹${category.baseFineAmount} - ₹${category.maxFineAmount}`
  }
  return `₹${category.baseFineAmount}`
}
