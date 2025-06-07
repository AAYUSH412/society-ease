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

// Get payment details by bill ID (for residents to view their payment details)
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

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`
}
