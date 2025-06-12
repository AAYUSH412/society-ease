"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Script from "next/script"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  CreditCard,
  IndianRupee,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Download
} from "lucide-react"
import { 
  getBillDetails,
  createPaymentOrder,
  verifyPayment,
  downloadBillPDF,
  type Bill,
  type Payment
} from "@/lib/api/billing"

declare global {
  interface Window {
    Razorpay: {
      new (options: {
        key: string
        amount: number
        currency: string
        name: string
        description: string
        order_id: string
        handler: (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => void
        prefill: {
          name: string
          email: string
          contact: string
        }
        theme: {
          color: string
        }
      }): {
        open: () => void
      }
    }
  }
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const billId = params.billId as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const fetchBillDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getBillDetails(billId)
      setBill(response.data.bill)
      setPayments(response.data.payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bill details')
    } finally {
      setLoading(false)
    }
  }, [billId])

  useEffect(() => {
    if (billId) {
      fetchBillDetails()
    }
  }, [billId, fetchBillDetails])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  const handlePayment = async () => {
    if (!bill || !razorpayLoaded) return

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      setError('Payment gateway not configured. Please contact support.')
      return
    }

    try {
      setProcessing(true)
      
      // Create payment order
      const paymentOrder = await createPaymentOrder(billId)
      
      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: paymentOrder.data.amount,
        currency: paymentOrder.data.currency,
        name: "Society Ease",
        description: `Payment for Bill #${bill.billNumber}`,
        order_id: paymentOrder.data.orderId,
        handler: async function (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billId: billId
            })
            
            // Store payment data temporarily for success page
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('paymentData', JSON.stringify(verificationResult.data))
            }
            
            // Redirect to success page
            router.push(`/resident/billing/payment-success?billId=${billId}`)
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError)
            router.push(`/resident/billing/payment-failure?billId=${billId}`)
          }
        },
        prefill: {
          name: user?.fullName || "Resident",
          email: user?.email || "resident@email.com",
          contact: user?.phone || "9999999999"
        },
        theme: {
          color: "#3b82f6"
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadBill = async () => {
    try {
      const blob = await downloadBillPDF(billId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bill-${bill?.billNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading bill:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        
        userName={user?.fullName || "Resident"}
        userEmail={user?.email || "resident@email.com"}
        notifications={2}
      >
        <DashboardContent
          title="Payment"
          description="Loading bill details..."
        >
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  if (error || !bill) {
    return (
      <DashboardLayout
        
        userName={user?.fullName || "Resident"}
        userEmail={user?.email || "resident@email.com"}
        notifications={2}
      >
        <DashboardContent
          title="Payment"
          description="Bill not found"
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        >
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Bill</h3>
                <p className="text-gray-600 mb-4">{error || 'Bill not found'}</p>
                <Button onClick={() => router.push('/resident/billing')}>
                  Go to Billing Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  const remainingAmount = bill.amount.totalAmount - (bill.paidAmount || 0)
  const isPaid = bill.status === 'paid'

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setError('Failed to load payment gateway. Please refresh the page.')}
      />
      <DashboardLayout
        
        userName={user?.fullName || "Resident"}
        userEmail={user?.email || "resident@email.com"}
        notifications={2}
      >
      <DashboardContent
        title="Payment"
        description={`Bill #${bill.billNumber}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={handleDownloadBill}>
              <Download className="h-4 w-4 mr-2" />
              Download Bill
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bill Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {bill.billType}
                    </CardTitle>
                    <CardDescription>
                      Bill #{bill.billNumber} • {formatDate(bill.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bill Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Flat Number</label>
                    <p className="text-lg font-semibold">{bill.flatNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    <p className={`text-lg font-semibold ${bill.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(bill.dueDate)}
                      {bill.isOverdue && (
                        <span className="text-sm text-red-600 ml-2">(Overdue)</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Billing Period</label>
                    <p className="text-lg font-semibold">
                      {new Date(bill.billingPeriod.year, bill.billingPeriod.month - 1).toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Society</label>
                    <p className="text-lg font-semibold">{bill.societyName}</p>
                  </div>
                </div>

                <Separator />

                {/* Amount Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Amount Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span className="font-semibold">{formatCurrency(bill.amount.totalAmount)}</span>
                    </div>
                    {bill.paidAmount && bill.paidAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Paid Amount</span>
                        <span className="font-semibold">-{formatCurrency(bill.paidAmount)}</span>
                      </div>
                    )}
                    {bill.penalties && bill.penalties.length > 0 && (
                      <div className="space-y-2">
                        {bill.penalties.map((penalty, index) => (
                          <div key={index} className="flex justify-between text-red-600">
                            <span>{penalty.reason}</span>
                            <span className="font-semibold">+{formatCurrency(penalty.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Amount to Pay</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                  </div>
                </div>

                {bill.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-600">{bill.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
                <CardDescription>
                  Complete your payment securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPaid ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-700 mb-2">
                      Bill Paid
                    </h3>
                    <p className="text-gray-600">
                      This bill has been fully paid.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Amount to Pay</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(remainingAmount)}
                      </p>
                    </div>

                    <Button
                      onClick={handlePayment}
                      disabled={processing || !razorpayLoaded}
                      className="w-full"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : !razorpayLoaded ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading Payment Gateway...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-gray-500 text-center">
                      Secure payment powered by Razorpay
                    </div>
                  </>
                )}

                {/* Payment History */}
                {payments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div key={payment._id} className="text-sm border rounded p-2">
                          <div className="flex justify-between">
                            <span>{formatCurrency(payment.amount)}</span>
                            <Badge variant={payment.status === 'completed' ? 'secondary' : 'destructive'}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatDate(payment.paymentDate)} • {payment.paymentMethod}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
    </>
  )
}
