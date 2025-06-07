// API functions for parking violation fine management
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

// Fine Types
export interface ViolationFine {
  _id: string
  fineId: string
  violationId: string
  violation: {
    violationId: string
    category: string
    description: string
    incidentDateTime: string
    location: string
  }
  residentId: string
  resident: {
    flatNumber: string
    building?: string
    name: string
    email: string
    phone: string
  }
  fineAmount: number
  lateFee: number
  totalAmount: number
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'waived' | 'disputed'
  paymentStatus: 'unpaid' | 'paid' | 'partially_paid' | 'failed'
  issuedDate: string
  dueDate: string
  paidDate?: string
  paidAmount: number
  paymentMethod?: 'online' | 'cash' | 'cheque' | 'bank_transfer'
  paymentReference?: string
  adminNotes?: string
  isOverdue: boolean
  daysOverdue: number
  remindersSent: number
  lastReminderSent?: string
  waiver?: {
    requestedAt: string
    requestedBy: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    reviewedAt?: string
    reviewedBy?: string
    adminNotes?: string
  }
  dispute?: {
    raisedAt: string
    reason: string
    evidence?: string[]
    status: 'pending' | 'resolved' | 'rejected'
    resolution?: string
    resolvedAt?: string
  }
  bill?: {
    billId: string
    billNumber: string
    integrationStatus: 'pending' | 'integrated' | 'failed'
  }
  createdAt: string
  updatedAt: string
}

export interface FineFilters {
  page?: number
  limit?: number
  status?: string
  paymentStatus?: string
  isOverdue?: boolean
  residentId?: string
  flatNumber?: string
  building?: string
  violationCategory?: string
  amountMin?: number
  amountMax?: number
  issuedDateFrom?: string
  issuedDateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FineStats {
  total: number
  pending: number
  paid: number
  overdue: number
  waived: number
  disputed: number
  totalAmount: number
  collectedAmount: number
  pendingAmount: number
  overdueAmount: number
  collectionRate: number
  averageFineAmount: number
  averagePaymentTime: number
}

export interface FineAnalytics {
  overview: FineStats
  monthlyTrends: Array<{
    month: string
    finesIssued: number
    totalAmount: number
    collectedAmount: number
    collectionRate: number
  }>
  categoryWise: Array<{
    category: string
    finesIssued: number
    totalAmount: number
    collectedAmount: number
    averageAmount: number
  }>
  buildingWise: Array<{
    building: string
    finesIssued: number
    totalAmount: number
    collectedAmount: number
    collectionRate: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
    percentage: number
  }>
}

export interface IssueFineRequest {
  violationId: string
  fineAmount: number
  dueDate: string
  adminNotes?: string
  sendNotification?: boolean
  integrateToBilling?: boolean
}

export interface PaymentRecordRequest {
  amount: number
  paymentMethod: 'online' | 'cash' | 'cheque' | 'bank_transfer'
  paymentReference?: string
  adminNotes?: string
  paymentDate?: string
}

// Get all fines with filters
export const getAllFines = async (filters?: FineFilters): Promise<ApiResponse<{
  fines: ViolationFine[]
  pagination: {
    currentPage: number
    totalPages: number
    totalFines: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: FineStats
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
    `${API_BASE}/admin/parking/violations/fines?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get overdue fines
export const getOverdueFines = async (filters?: FineFilters): Promise<ApiResponse<{
  fines: ViolationFine[]
  pagination: {
    currentPage: number
    totalPages: number
    totalFines: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const params = new URLSearchParams()
  params.append('isOverdue', 'true')
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get fine details by ID
export const getFineDetails = async (fineId: string): Promise<ApiResponse<{
  fine: ViolationFine
  paymentHistory: Array<{
    amount: number
    paymentMethod: string
    paymentDate: string
    reference?: string
    status: string
  }>
  relatedFines: ViolationFine[]
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Get fine by ID (alias for getFineDetails for compatibility)
export const getFineById = getFineDetails

// Add note to fine
export const addFineNote = async (
  fineId: string,
  noteData: {
    note: string
    type: 'internal' | 'public'
    addedBy: string
    addedAt: string
  }
): Promise<ApiResponse<ViolationFine>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/notes`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(noteData)
    }
  )
  
  return handleResponse(response)
}

// Issue fine for violation
export const issueFine = async (fineData: IssueFineRequest): Promise<ApiResponse<ViolationFine>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/issue-fine/${fineData.violationId}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(fineData)
    }
  )
  
  return handleResponse(response)
}

// Record manual payment
export const recordPayment = async (
  fineId: string,
  paymentData: PaymentRecordRequest
): Promise<ApiResponse<ViolationFine>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/payment`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    }
  )
  
  return handleResponse(response)
}

// Update fine status
export const updateFineStatus = async (
  fineId: string,
  status: ViolationFine['status'],
  notes?: string
): Promise<ApiResponse<ViolationFine>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/status`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    }
  )
  
  return handleResponse(response)
}

// Waive fine
export const waiveFine = async (
  fineId: string,
  waiverData: {
    reason: string
    adminNotes?: string
  }
): Promise<ApiResponse<ViolationFine>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/waive`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(waiverData)
    }
  )
  
  return handleResponse(response)
}

// Apply late fee
export const applyLateFee = async (
  fineId: string,
  lateFeeData: {
    amount: number
    reason?: string
  }
): Promise<ApiResponse<ViolationFine>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/late-fee`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lateFeeData)
    }
  )
  
  return handleResponse(response)
}

// Send payment reminder
export const sendPaymentReminder = async (
  fineId: string,
  reminderData: {
    type: 'first' | 'second' | 'final'
    customMessage?: string
  }
): Promise<ApiResponse<{
  sent: boolean
  message: string
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/reminder`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData)
    }
  )
  
  return handleResponse(response)
}

// Bulk send reminders
export const bulkSendReminders = async (bulkData: {
  fineIds: string[]
  reminderType: 'first' | 'second' | 'final'
  customMessage?: string
  daysOverdueMin?: number
}): Promise<ApiResponse<{
  processed: number
  sent: number
  failed: number
  results: Array<{
    fineId: string
    status: 'sent' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/bulk/reminders`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bulkData)
    }
  )
  
  return handleResponse(response)
}

// Get fine analytics
export const getFineAnalytics = async (params?: {
  year?: number
  month?: number
  building?: string
  category?: string
}): Promise<ApiResponse<FineAnalytics>> => {
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/analytics?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  return handleResponse(response)
}

// Export fines
export const exportFines = async (filters?: FineFilters & {
  format?: 'csv' | 'excel' | 'pdf'
  includePaymentHistory?: boolean
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
    `${API_BASE}/admin/parking/violations/fines/export?${params.toString()}`,
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

// Generate fine receipt
export const generateReceipt = async (fineId: string): Promise<Blob> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/receipt`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  )
  
  if (!response.ok) {
    throw new Error('Receipt generation failed')
  }
  
  return response.blob()
}

// Integrate fine to billing system
export const integrateToBilling = async (
  fineId: string,
  billingData?: {
    dueDate?: string
    description?: string
    additionalCharges?: number
  }
): Promise<ApiResponse<{
  billId: string
  billNumber: string
  integrationStatus: string
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/${fineId}/integrate-billing`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(billingData || {})
    }
  )
  
  return handleResponse(response)
}

// Bulk operations
export const bulkUpdateFines = async (bulkData: {
  fineIds: string[]
  action: 'waive' | 'apply_late_fee' | 'mark_paid' | 'send_reminder'
  actionData?: Record<string, unknown>
}): Promise<ApiResponse<{
  processed: number
  successful: number
  failed: number
  results: Array<{
    fineId: string
    status: 'success' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(
    `${API_BASE}/admin/parking/violations/fines/bulk/update`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bulkData)
    }
  )
  
  return handleResponse(response)
}

// Utility functions
export const calculateTotalAmount = (fine: ViolationFine): number => {
  return fine.fineAmount + fine.lateFee
}

export const getFineStatusColor = (status: string): string => {
  const colors = {
    pending: '#f59e0b',     // yellow
    paid: '#22c55e',        // green
    partially_paid: '#3b82f6', // blue
    overdue: '#ef4444',     // red
    waived: '#6b7280',      // gray
    disputed: '#8b5cf6'     // purple
  }
  return colors[status as keyof typeof colors] || '#6b7280'
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}
