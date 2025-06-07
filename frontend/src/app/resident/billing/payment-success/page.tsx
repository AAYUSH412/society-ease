"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle,
  Home,
  Receipt,
  Download
} from "lucide-react"
import { getPaymentByBillId, downloadPaymentReceipt } from "@/lib/api/billing"

interface PaymentData {
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
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const billId = searchParams.get('billId')
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First try to get payment data from sessionStorage
        const storedPaymentData = sessionStorage.getItem('paymentData')
        if (storedPaymentData) {
          const parsedData = JSON.parse(storedPaymentData)
          setPaymentData(parsedData)
          setLoading(false)
          // Clear the stored data after using it
          sessionStorage.removeItem('paymentData')
          return
        }
        
        // If no stored data and billId is available, fetch from API
        if (billId) {
          const response = await getPaymentByBillId(billId)
          setPaymentData(response.data)
        } else {
          setError('No payment information available')
        }
      } catch (error) {
        console.error('Error fetching payment data:', error)
        setError('Failed to load payment information')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [billId])

  const handleDownloadReceipt = async () => {
    if (!paymentData?.payment?.paymentId) return
    
    try {
      setDownloading(true)
      const blob = await downloadPaymentReceipt(paymentData.payment.paymentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payment-receipt-${paymentData.payment.receiptNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading receipt:', error)
      setError('Failed to download receipt. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <DashboardLayout
      
      userName={user?.fullName || "Resident"}
      userEmail={user?.email || "resident@email.com"}
      notifications={2}
    >
      <DashboardContent
        title="Payment Successful"
        description="Your payment has been processed successfully"
      >
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-700">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-lg">
                Your payment has been processed and your bill has been updated.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Payment Details */}
              {loading && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {paymentData && !loading && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Payment Details</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receipt Number:</span>
                      <span className="font-medium">#{paymentData.payment.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium">{paymentData.payment.paymentId}</span>
                    </div>
                    {paymentData.payment.razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">{paymentData.payment.razorpayPaymentId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{paymentData.payment.paymentMethod}</span>
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <h4 className="font-medium text-gray-900 mb-2">Bill Details</h4>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bill Number:</span>
                        <span className="font-medium">#{paymentData.bill.billNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bill Type:</span>
                        <span className="font-medium capitalize">{paymentData.bill.billType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flat Number:</span>
                        <span className="font-medium">{paymentData.bill.flatNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Period:</span>
                        <span className="font-medium">
                          {new Date(paymentData.bill.billingPeriod.year, paymentData.bill.billingPeriod.month - 1).toLocaleDateString('en-IN', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Base Amount:</span>
                        <span>{formatCurrency(paymentData.bill.amount.baseAmount)}</span>
                      </div>
                      {paymentData.bill.amount.taxes > 0 && (
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Taxes:</span>
                          <span>{formatCurrency(paymentData.bill.amount.taxes)}</span>
                        </div>
                      )}
                      {paymentData.bill.amount.lateFee > 0 && (
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Late Fee:</span>
                          <span>{formatCurrency(paymentData.bill.amount.lateFee)}</span>
                        </div>
                      )}
                      {paymentData.bill.amount.otherCharges > 0 && (
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Other Charges:</span>
                          <span>{formatCurrency(paymentData.bill.amount.otherCharges)}</span>
                        </div>
                      )}
                      {paymentData.bill.amount.discount > 0 && (
                        <div className="flex justify-between text-xs text-green-600 mb-1">
                          <span>Discount:</span>
                          <span>-{formatCurrency(paymentData.bill.amount.discount)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(paymentData.payment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">
                        {new Date(paymentData.payment.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You will receive a payment confirmation email shortly</li>
                  <li>• Your bill status has been updated to &quot;Paid&quot;</li>
                  <li>• Download your payment receipt for your records</li>
                  <li>• Check your billing dashboard for updated information</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleDownloadReceipt}
                  variant="outline" 
                  className="flex-1"
                  disabled={!paymentData || downloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download Receipt'}
                </Button>
                
                <Button 
                  onClick={() => router.push('/resident/billing')}
                  variant="outline" 
                  className="flex-1"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  View All Bills
                </Button>
                
                <Button 
                  onClick={() => router.push('/resident/dashboard')}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Support Info */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>
                  Need help? Contact our support team at{' '}
                  <a href="mailto:support@societyease.com" className="text-blue-600 hover:underline">
                    support@societyease.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
