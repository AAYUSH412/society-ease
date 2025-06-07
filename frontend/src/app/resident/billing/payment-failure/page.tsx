"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  XCircle,
  RefreshCw,
  Home,
  CreditCard,
  AlertTriangle,
  Phone,
  Mail
} from "lucide-react"
import { getBillDetails, type Bill } from "@/lib/api/billing"

export default function PaymentFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const billId = searchParams.get('billId')
  
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (billId) {
      fetchBillDetails()
    }
  }, [billId])

  const fetchBillDetails = async () => {
    try {
      setLoading(true)
      if (billId) {
        const response = await getBillDetails(billId)
        setBill(response.data.bill)
      }
    } catch (error) {
      console.error('Error fetching bill details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const handleRetryPayment = () => {
    if (billId) {
      router.push(`/resident/billing/pay/${billId}`)
    }
  }

  return (
    <DashboardLayout
      
      userName={user?.fullName || "Resident"}
      userEmail={user?.email || "resident@email.com"}
      notifications={2}
    >
      <DashboardContent
        title="Payment Failed"
        description="We couldn't process your payment"
      >
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-700">
                Payment Failed
              </CardTitle>
              <CardDescription className="text-lg">
                We encountered an issue while processing your payment. Please try again.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Bill Details */}
              {bill && !loading && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Bill Details</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill Number:</span>
                      <span className="font-medium">#{bill.billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill Type:</span>
                      <span className="font-medium">{bill.billType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flat Number:</span>
                      <span className="font-medium">{bill.flatNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(bill.amount - (bill.paidAmount || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Reasons */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Common Reasons for Payment Failure
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Insufficient balance in your account</li>
                  <li>• Network connectivity issues</li>
                  <li>• Incorrect card details or expired card</li>
                  <li>• Bank security restrictions</li>
                  <li>• Transaction timeout</li>
                </ul>
              </div>

              {/* What to do next */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What to do next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your account balance and card details</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Try using a different payment method</li>
                  <li>• Contact your bank if the issue persists</li>
                  <li>• Reach out to our support team for assistance</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleRetryPayment}
                  className="flex-1"
                  disabled={!billId}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => router.push('/resident/billing')}
                  variant="outline" 
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  View All Bills
                </Button>
                
                <Button 
                  onClick={() => router.push('/resident/dashboard')}
                  variant="outline" 
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>

              {/* Support Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-600">Email:</span>
                    <a 
                      href="mailto:support@societyease.com" 
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      support@societyease.com
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-600">Phone:</span>
                    <a 
                      href="tel:+911234567890" 
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      +91 12345 67890
                    </a>
                  </div>
                  <p className="text-gray-600 text-xs mt-2">
                    Our support team is available 24/7 to help you with payment issues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
