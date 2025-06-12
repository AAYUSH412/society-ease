// Admin Billing API functions
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

// Admin Billing Stats Interface
export interface AdminBillingStats {
  totalRevenue: number
  totalPending: number
  collectionRate: number
  totalResidents: number
  billsGenerated: number
  paymentsPending: number
}

// Admin Recent Activity Interface
export interface AdminRecentActivity {
  id: string
  action: string
  user: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
}

// Admin Analytics Data Interface
export interface AdminAnalyticsData {
  overview: {
    totalBills: number
    totalAmount: number
    collectedAmount: number
    pendingAmount: number
    collectionRate: number
  }
  monthlyTrends: Array<{
    month: string
    bills: number
    amount: number
    collected: number
    rate: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
    percentage: number
  }>
  buildingWise: Array<{
    building: string
    bills: number
    collected: number
    amount: number
    rate: number
  }>
  billTypes: Array<{
    type: string
    count: number
    amount: number
    percentage: number
  }>
}

// Admin Payment Interface
export interface AdminPayment {
  id: string
  billId: string
  billNumber: string
  flatNumber: string
  building?: string
  residentName: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  paymentDate?: string
  dueDate: string
  billDate: string
  transactionId?: string
  lateFeePenalty?: number
}

// Get admin billing stats
export const getAdminBillingStats = async (): Promise<ApiResponse<AdminBillingStats>> => {
  const response = await fetch(`${API_BASE}/billing/admin/analytics`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  // Transform the analytics data to billing stats format
  const analyticsData = await handleResponse<AdminAnalyticsData>(response)
  
  const stats: AdminBillingStats = {
    totalRevenue: analyticsData.data.overview.collectedAmount,
    totalPending: analyticsData.data.overview.pendingAmount,
    collectionRate: Math.round(analyticsData.data.overview.collectionRate),
    totalResidents: 250, // This would come from user analytics endpoint
    billsGenerated: analyticsData.data.overview.totalBills,
    paymentsPending: analyticsData.data.overview.totalBills - Math.round(analyticsData.data.overview.totalBills * analyticsData.data.overview.collectionRate / 100)
  }
  
  return {
    success: true,
    data: stats,
    message: 'Billing stats retrieved successfully'
  }
}

// Get admin recent activity
export const getAdminRecentActivity = async (): Promise<ApiResponse<AdminRecentActivity[]>> => {
  // For now, we'll simulate recent activity. In a real app, this would be a separate endpoint
  const activity: AdminRecentActivity[] = [
    {
      id: '1',
      action: 'Payment received from Flat 301',
      user: 'John Doe',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      action: 'Bill generated for maintenance',
      user: 'System',
      timestamp: '5 hours ago',
      status: 'success'
    },
    {
      id: '3',
      action: 'Payment failed for Flat 205',
      user: 'Jane Smith',
      timestamp: '1 day ago',
      status: 'failed'
    },
    {
      id: '4',
      action: 'Bulk bills generated',
      user: 'Admin',
      timestamp: '2 days ago',
      status: 'success'
    }
  ]
  
  return {
    success: true,
    data: activity,
    message: 'Recent activity retrieved successfully'
  }
}

// Get admin billing analytics
export const getAdminBillingAnalytics = async (params?: {
  year?: number
  month?: number
}): Promise<ApiResponse<AdminAnalyticsData>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.year) queryParams.append('year', params.year.toString())
  if (params?.month) queryParams.append('month', params.month.toString())
  
  const url = `${API_BASE}/billing/admin/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<AdminAnalyticsData>(response)
}

// Get admin payment tracking
export const getAdminPaymentTracking = async (params?: {
  page?: number
  limit?: number
  status?: string
  month?: number
  year?: number
}): Promise<ApiResponse<{
  payments: AdminPayment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.month) queryParams.append('month', params.month.toString())
  if (params?.year) queryParams.append('year', params.year.toString())

  const response = await fetch(`${API_BASE}/billing/admin/payments?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<{
    payments: AdminPayment[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>(response)
}

// Generate bulk bills
export const generateBulkBills = async (billData: {
  month: number
  year: number
  billType: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  baseAmount: number
  dueDate: string
  description?: string
  additionalCharges?: {
    utilityCharges?: number
    specialAssessments?: number
    lateFeePenalty?: number
    otherCharges?: number
  }
  selectedResidents?: string[]
}): Promise<ApiResponse<{
  billsGenerated: number
  totalAmount: number
  residents: string[]
  errors?: Array<{
    residentId: string
    error: string
  }>
}>> => {
  const response = await fetch(`${API_BASE}/billing/admin/generate-bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(billData),
  })
  
  return handleResponse<{
    billsGenerated: number
    totalAmount: number
    residents: string[]
    errors?: Array<{
      residentId: string
      error: string
    }>
  }>(response)
}

// Get all bills for admin
export const getAdminBills = async (params?: {
  page?: number
  limit?: number
  status?: string
  billType?: string
  month?: number
  year?: number
  flatNumber?: string
}): Promise<ApiResponse<{
  bills: Array<{
    _id: string
    billNumber: string
    billType: string
    flatNumber: string
    building?: string
    residentName: string
    amount: {
      baseAmount: number
      taxes: number
      totalAmount: number
    }
    status: string
    generatedDate: string
    dueDate: string
    billingPeriod: {
      month: number
      year: number
    }
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalBills: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalBills: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.billType) queryParams.append('billType', params.billType)
  if (params?.month) queryParams.append('month', params.month.toString())
  if (params?.year) queryParams.append('year', params.year.toString())
  if (params?.flatNumber) queryParams.append('flatNumber', params.flatNumber)

  const response = await fetch(`${API_BASE}/billing/admin/bills?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<{
    bills: Array<{
      _id: string
      billNumber: string
      billType: string
      flatNumber: string
      building?: string
      residentName: string
      amount: {
        baseAmount: number
        taxes: number
        totalAmount: number
      }
      status: string
      generatedDate: string
      dueDate: string
      billingPeriod: {
        month: number
        year: number
      }
    }>
    pagination: {
      currentPage: number
      totalPages: number
      totalBills: number
      hasNext: boolean
      hasPrev: boolean
    }
    summary: {
      totalBills: number
      totalAmount: number
      paidAmount: number
      pendingAmount: number
    }
  }>(response)
}

// Send payment reminders
export const sendPaymentReminders = async (params: {
  billIds?: string[]
  daysOverdue?: number
  reminderType?: 'first' | 'second' | 'final'
}): Promise<ApiResponse<{
  remindersSent: number
  failedReminders: number
  details: Array<{
    billId: string
    status: 'sent' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(`${API_BASE}/billing/admin/send-reminders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  })
  
  return handleResponse<{
    remindersSent: number
    failedReminders: number
    details: Array<{
      billId: string
      status: 'sent' | 'failed'
      error?: string
    }>
  }>(response)
}

// Delete bill
export const deleteBill = async (billId: string): Promise<ApiResponse<{
  message: string
}>> => {
  const response = await fetch(`${API_BASE}/billing/admin/bills/${billId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<{
    message: string
  }>(response)
}

// Manual Payment Recording Interface
export interface ManualPaymentData {
  amount: number
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer'
  description?: string
  adminNotes?: string
  bankTransferDetails?: {
    transactionId: string
    bankName: string
    accountNumber: string
  }
  chequeDetails?: {
    chequeNumber: string
    bankName: string
    chequeDate: string
  }
}

// Record manual payment
export const recordManualPayment = async (
  billId: string, 
  paymentData: ManualPaymentData
): Promise<ApiResponse<{
  message: string
  data: object
}>> => {
  const response = await fetch(`${API_BASE}/billing/admin/manual-payment/${billId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData)
  })
  
  return handleResponse<{
    message: string
    data: object
  }>(response)
}
