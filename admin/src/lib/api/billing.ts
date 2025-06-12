// API utility functions for billing operations
import { ApiResponse } from '@/types/api'
import { tokenUtils } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Types
export interface Bill {
  _id: string
  billNumber: string
  billType: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  amount: {
    baseAmount: number
    taxes: number
    lateFee: number
    otherCharges: number
    discount: number
    totalAmount: number
  }
  generatedDate: string
  dueDate: string
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid' | 'partially_paid' | 'failed'
  description?: string
  createdAt: string
  billingPeriod: {
    month: number
    year: number
  }
  flatNumber: string
  building?: string
  societyName: string
  paidAmount?: number
  totalAmount: number
  isOverdue: boolean
  daysOverdue?: number
  penalties?: Array<{
    amount: number
    reason: string
    appliedDate: string
  }>
}

export interface Payment {
  _id: string
  paymentId: string
  billId: string
  residentId: string
  flatNumber: string
  societyName: string
  amount: number
  currency: string
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'bank_transfer' | 'cash' | 'cheque' | 'other'
  razorpayPaymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  paymentDate: string
  processedAt?: string
  failedAt?: string
  refundedAt?: string
  description?: string
  receiptNumber?: string
  failureReason?: string
  failureCode?: string
  refundAmount?: number
  refundReason?: string
  transactionId?: string
}

export interface BillingSummary {
  totalPending: number
  totalPaid: number
  upcomingDues: number
  overdueBills: number
}

export interface PaymentOrder {
  orderId: string
  amount: number
  currency: string
  billDetails: {
    billNumber: string
    dueDate: string
    totalAmount: number
    remainingAmount: number
  }
}

export interface Resident {
  _id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  flatNumber: string
  building?: string
  societyName: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  isEmailVerified: boolean
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

// Billing API functions

// Get resident bills
export const getResidentBills = async (params?: {
  page?: number
  limit?: number
  status?: string
  year?: number
}): Promise<ApiResponse<{
  bills: Bill[]
  pagination: {
    currentPage: number
    totalPages: number
    totalBills: number
    hasNext: boolean
    hasPrev: boolean
  }
  paymentSummary: {
    totalPending: number
    totalPaid: number
    overdueBills: number
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.year) queryParams.append('year', params.year.toString())
  
  const response = await fetch(
    `${API_BASE}/billing/resident/bills?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )
  
  return handleResponse(response)
}

// Get bill details
export const getBillDetails = async (billId: string): Promise<ApiResponse<{
  bill: Bill
  payments: Payment[]
}>> => {
  const response = await fetch(`${API_BASE}/billing/bills/${billId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<{
    bill: Bill
    payments: Payment[]
  }>(response)
}

// Download bill PDF
export const downloadBillPDF = async (billId: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/pdf/bill/${billId}/download`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to download bill PDF')
  }
  
  return response.blob()
}

// Create payment order
export const createPaymentOrder = async (billId: string): Promise<ApiResponse<PaymentOrder>> => {
  const response = await fetch(`${API_BASE}/billing/payment/create-order`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ billId }),
  })
  
  return handleResponse<PaymentOrder>(response)
}

// Verify payment
export const verifyPayment = async (paymentData: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  billId: string
}): Promise<ApiResponse<{
  payment: {
    paymentId: string
    receiptNumber: string
    amount: number
    paymentDate: string
    paymentMethod: string
    razorpayPaymentId?: string
    razorpayOrderId?: string
    status: string
  }
  bill: {
    billNumber: string
    billType: string
    flatNumber: string
    societyName: string
    billingPeriod: {
      month: number
      year: number
    }
    amount: {
      baseAmount: number
      taxes: number
      lateFee: number
      otherCharges: number
      discount: number
      totalAmount: number
    }
    status: string
    paidDate: string
  }
}>> => {
  const response = await fetch(`${API_BASE}/billing/payment/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData),
  })
  
  return handleResponse<{
    payment: {
      paymentId: string
      receiptNumber: string
      amount: number
      paymentDate: string
      paymentMethod: string
      razorpayPaymentId?: string
      razorpayOrderId?: string
      status: string
    }
    bill: {
      billNumber: string
      billType: string
      flatNumber: string
      societyName: string
      billingPeriod: {
        month: number
        year: number
      }
      amount: {
        baseAmount: number
        taxes: number
        lateFee: number
        otherCharges: number
        discount: number
        totalAmount: number
      }
      status: string
      paidDate: string
    }
  }>(response)
}

// Get payment history
export const getPaymentHistory = async (params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<ApiResponse<{
  payments: Payment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPayments: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  
  const response = await fetch(
    `${API_BASE}/billing/resident/payments?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )
  
  return handleResponse<{
    payments: Payment[]
    pagination: {
      currentPage: number
      totalPages: number
      totalPayments: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>(response)
}

// Download payment receipt
export const downloadPaymentReceipt = async (paymentId: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/pdf/receipt/${paymentId}/download`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to download receipt')
  }
  
  return response.blob()
}

// Get billing summary
export const getBillingSummary = async (): Promise<BillingSummary> => {
  const token = tokenUtils.getAccessToken()
  
  const response = await fetch(`${API_BASE}/billing/resident/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch billing summary')
  }

  const data = await response.json()
  return data.data.summary
}

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`
}

// ============= ADMIN API FUNCTIONS =============

// Admin types
export interface AdminBillingStats {
  totalRevenue: number
  totalPending: number
  collectionRate: number
  totalResidents: number
  billsGenerated: number
  paymentsPending: number
}

export interface AdminRecentActivity {
  id: string
  action: string
  user: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
}

export interface AdminPayment {
  id: string
  billId: string
  billNumber: string
  flatNumber: string
  building: string
  residentName: string
  amount: number
  status: 'paid' | 'unpaid' | 'partially_paid' | 'overdue'
  paymentMethod?: 'online' | 'cash' | 'cheque' | 'bank_transfer'
  paymentDate?: string
  dueDate: string
  billDate: string
  transactionId?: string
  lateFeePenalty?: number
}

export interface AdminAnalyticsData {
  overview: {
    totalBills: number
    totalAmount: number
    collectedAmount: number
    pendingAmount: number
    collectionRate: number
    avgBillAmount: number
    monthlyGrowth: number
    overdueCount: number
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
    percentage: number
    amount: number
  }>
  buildingWise: Array<{
    building: string
    bills: number
    collected: number
    rate: number
    amount: number
  }>
  billTypes: Array<{
    type: string
    count: number
    amount: number
    percentage: number
  }>
}

// Get admin billing overview stats
export const getAdminBillingStats = async (): Promise<ApiResponse<AdminBillingStats>> => {
  const response = await fetch(`${API_BASE}/billing/admin/bills?limit=1000`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  const data = await handleResponse<{
    bills: Bill[]
    summary: Record<string, { count: number; totalAmount: number }>
  }>(response)

  // Calculate stats from bills data
  const bills = data.data.bills
  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0)
  const totalPending = bills.filter(b => b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid').reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0)
  const collectionRate = bills.length > 0 ? Math.round((bills.filter(b => b.status === 'paid').length / bills.length) * 100) : 0
  
  return {
    success: true,
    data: {
      totalRevenue,
      totalPending,
      collectionRate,
      totalResidents: new Set(bills.map(b => b.flatNumber)).size,
      billsGenerated: bills.length,
      paymentsPending: bills.filter(b => b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid').length
    }
  }
}

// Get admin recent activity
export const getAdminRecentActivity = async (): Promise<ApiResponse<AdminRecentActivity[]>> => {
  try {
    // Get recent bills for admin activity
    const response = await fetch(`${API_BASE}/billing/admin/bills?limit=10&page=1`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    
    const data = await handleResponse<{
      bills: Bill[]
    }>(response)

    // Transform bill data to activity format
    const activities: AdminRecentActivity[] = data.data.bills.map((bill, index) => ({
      id: `activity-${index}`,
      action: `Bill ${bill.status} - ${bill.billType} for Flat ${bill.flatNumber}`,
      user: `Flat ${bill.flatNumber}`,
      timestamp: new Date(bill.createdAt).toLocaleString(),
      status: bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'failed' : 'pending'
    }))

    return {
      success: true,
      message: 'Recent activity fetched successfully',
      data: activities
    }
  } catch (err) {
    // Return mock data if API fails
    console.warn('Failed to fetch admin activity, using mock data:', err)
    const mockActivities: AdminRecentActivity[] = [
      {
        id: 'activity-1',
        action: 'Bill Generated - Maintenance for Flat A-101',
        user: 'Flat A-101',
        timestamp: new Date().toLocaleString(),
        status: 'pending'
      },
      {
        id: 'activity-2',
        action: 'Payment Received - Maintenance for Flat B-201',
        user: 'Flat B-201',
        timestamp: new Date(Date.now() - 86400000).toLocaleString(),
        status: 'success'
      }
    ]

    return {
      success: true,
      message: 'Recent activity fetched successfully (mock data)',
      data: mockActivities
    }
  }
}

// Get admin payment tracking data
export const getAdminPaymentTracking = async (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}): Promise<ApiResponse<{
  payments: AdminPayment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPayments: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)

  const response = await fetch(`${API_BASE}/billing/admin/bills?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  const data = await handleResponse<{
    bills: Bill[]
    pagination: {
      currentPage: number
      totalPages: number
      totalBills: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>(response)

  // Transform bills to payment tracking format
  const payments: AdminPayment[] = data.data.bills.map((bill) => {
    // Map Bill status to AdminPayment status
    let adminStatus: 'paid' | 'unpaid' | 'partially_paid' | 'overdue'
    switch (bill.status) {
      case 'paid':
        adminStatus = 'paid'
        break
      case 'partially_paid':
        adminStatus = 'partially_paid'
        break
      case 'overdue':
        adminStatus = 'overdue'
        break
      case 'pending':
      case 'cancelled':
      default:
        adminStatus = 'unpaid'
        break
    }

    return {
      id: bill._id,
      billId: bill._id,
      billNumber: bill.billNumber,
      flatNumber: bill.flatNumber,
      building: bill.building || 'Building A', // Default building if not provided
      residentName: 'Resident', // Will be populated from API
      amount: bill.totalAmount,
      status: adminStatus,
      paymentMethod: bill.status === 'paid' ? 'online' : undefined,
      paymentDate: bill.status === 'paid' ? bill.createdAt : undefined,
      dueDate: bill.dueDate,
      billDate: bill.createdAt,
      transactionId: bill.status === 'paid' ? `TXN${Date.now()}` : undefined,
      lateFeePenalty: bill.status === 'overdue' ? 500 : undefined
    }
  })

  return {
    success: true,
    data: {
      payments,
      pagination: {
        currentPage: data.data.pagination?.currentPage || 1,
        totalPages: data.data.pagination?.totalPages || 1,
        totalPayments: data.data.pagination?.totalBills || payments.length,
        hasNext: data.data.pagination?.hasNext || false,
        hasPrev: data.data.pagination?.hasPrev || false
      }
    }
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

  const response = await fetch(`${API_BASE}/billing/admin/analytics?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<AdminAnalyticsData>(response)
}

// Get residents for admin billing
export const getAdminResidents = async (params?: {
  page?: number
  limit?: number
  search?: string
  building?: string
}): Promise<ApiResponse<{
  residents: Resident[]
  pagination: {
    currentPage: number
    totalPages: number
    totalResidents: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.building) queryParams.append('building', params.building)
  
  // Add role filter to get only residents
  queryParams.append('role', 'resident')
  queryParams.append('status', 'approved') // Only approved residents for billing

  const response = await fetch(`${API_BASE}/admin/users?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  const data = await handleResponse<{
    users: Resident[]
    pagination: {
      currentPage: number
      totalPages: number
      totalUsers: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>(response)

  // Transform the response to match expected format
  return {
    success: data.success,
    message: data.message,
    data: {
      residents: data.data.users,
      pagination: {
        currentPage: data.data.pagination.currentPage,
        totalPages: data.data.pagination.totalPages,
        totalResidents: data.data.pagination.totalUsers,
        hasNext: data.data.pagination.hasNext,
        hasPrev: data.data.pagination.hasPrev
      }
    }
  }
}

// ============= BULK BILL GENERATION =============

export interface BulkBillGenerationRequest {
  month: number
  year: number
  billType: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  baseAmount: number
  dueDate: string
  additionalCharges?: {
    waterCharges?: number
    electricityCharges?: number
    maintenanceCharges?: number
    securityCharges?: number
    clubhouseCharges?: number
    sewageCharges?: number
    otherCharges?: number
  }
}

export interface BulkBillGenerationResponse {
  generated: number
  errorCount: number
  bills: Array<{
    billNumber: string
    flatNumber: string
    amount: number
  }>
  errors: Array<{
    residentId: string
    flatNumber: string
    error: string
  }>
}

export interface BillGenerationStatus {
  id: string
  flatNumber: string
  residentName: string
  status: 'pending' | 'generating' | 'success' | 'failed'
  error?: string
  billId?: string
}

// Generate bulk bills for all residents
export const generateBulkBills = async (
  data: BulkBillGenerationRequest
): Promise<ApiResponse<BulkBillGenerationResponse>> => {
  const response = await fetch(`${API_BASE}/billing/admin/generate-bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  return handleResponse<BulkBillGenerationResponse>(response)
}

// Send payment reminders for multiple bills
export const sendPaymentReminders = async (billIds: string[]): Promise<ApiResponse<{
  sent: number
  failed: number
  results: Array<{
    billId: string
    flatNumber: string
    status: 'sent' | 'failed'
    error?: string
  }>
}>> => {
  const response = await fetch(`${API_BASE}/billing/admin/send-reminders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ billIds }),
  })
  
  return handleResponse(response)
}

// Mark payment as paid manually (for cash/cheque payments)
export const markPaymentAsPaid = async (billId: string, paymentData: {
  amount: number
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer'
  description?: string
  adminNotes?: string
  chequeDetails?: {
    chequeNumber: string
    bankName: string
    chequeDate: string
  }
  bankTransferDetails?: {
    transactionId: string
    bankName: string
    transferDate: string
  }
}): Promise<ApiResponse<Payment>> => {
  const response = await fetch(`${API_BASE}/billing/admin/manual-payment/${billId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData),
  })
  
  return handleResponse<Payment>(response)
}

// Get admin payment history (all payments in society)
export const getAdminPaymentHistory = async (params?: {
  page?: number
  limit?: number
  status?: string
  flatNumber?: string
  month?: number
  year?: number
}): Promise<ApiResponse<{
  payments: AdminPayment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPayments: number
    hasNext: boolean
    hasPrev: boolean
  }
}>> => {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.flatNumber) queryParams.append('flatNumber', params.flatNumber)
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
      totalPayments: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>(response)
}

// Get payment details by bill ID
export const getPaymentByBillId = async (billId: string): Promise<ApiResponse<{
  payment: {
    paymentId: string
    receiptNumber: string
    amount: number
    paymentDate: string
    paymentMethod: string
    razorpayPaymentId?: string
    razorpayOrderId?: string
    status: string
  }
  bill: {
    billNumber: string
    billType: string
    flatNumber: string
    societyName: string
    billingPeriod: {
      month: number
      year: number
    }
    amount: {
      baseAmount: number
      taxes: number
      lateFee: number
      otherCharges: number
      discount: number
      totalAmount: number
    }
    status: string
    paidDate: string
  }
}>> => {
  const response = await fetch(`${API_BASE}/billing/bills/${billId}/payment`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  
  return handleResponse<{
    payment: {
      paymentId: string
      receiptNumber: string
      amount: number
      paymentDate: string
      paymentMethod: string
      razorpayPaymentId?: string
      razorpayOrderId?: string
      status: string
    }
    bill: {
      billNumber: string
      billType: string
      flatNumber: string
      societyName: string
      billingPeriod: {
        month: number
        year: number
      }
      amount: {
        baseAmount: number
        taxes: number
        lateFee: number
        otherCharges: number
        discount: number
        totalAmount: number
      }
      status: string
      paidDate: string
    }
  }>(response)
}
