"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Receipt, 
  Download, 
  Search,
  CheckCircle,
  CreditCard,
  Loader2,
  FileText
} from "lucide-react"
import { 
  getPaymentHistory, 
  downloadPaymentReceipt,
  type Payment 
} from "@/lib/api/billing"

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    status: 'all',
    search: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0
  })

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params: {
        page: number
        limit: number
        status?: string
        search?: string
      } = {
        page,
        limit: 10
      }

      if (filters.status !== 'all') {
        params.status = filters.status
      }

      const response = await getPaymentHistory(params)
      setPayments(response.data.payments)
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalPayments: response.data.pagination.totalPayments
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment history')
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPayments()
  }, [filters, fetchPayments])

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const blob = await downloadPaymentReceipt(paymentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${paymentId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading receipt:', error)
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'razorpay_upi':
      case 'online':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <Receipt className="h-4 w-4" />
      case 'cheque':
        return <FileText className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    if (!filters.search) return true
    return (
      payment.receiptNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.paymentId?.toLowerCase().includes(filters.search.toLowerCase())
    )
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View all your payment transactions and download receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt, transaction ID, or flat..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.year}
              onValueChange={(value) => setFilters({ ...filters, year: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center p-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchPayments()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Payments List */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredPayments.length > 0 ? (
                <>
                  {filteredPayments.map((payment) => (
                    <Card key={payment.paymentId || payment._id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{payment.receiptNumber || 'N/A'}</h3>
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p className="font-medium text-foreground">Amount</p>
                                <p className="font-semibold text-lg text-primary">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Payment Method</p>
                                <div className="flex items-center gap-1">
                                  {getPaymentMethodIcon(payment.paymentMethod)}
                                  <span className="capitalize">
                                    {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Date & Time</p>
                                <p>{formatDate(payment.paymentDate)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Transaction ID</p>
                                <p className="text-xs font-mono">
                                  {payment.transactionId || payment.razorpayPaymentId || 'N/A'}
                                </p>
                              </div>
                            </div>
                            {payment.description && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Description:</span> {payment.description}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {payment.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment.paymentId || payment._id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            )}
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Verified</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredPayments.length} of {pagination.totalPayments} payments
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchPayments(pagination.currentPage - 1)}
                          disabled={pagination.currentPage <= 1}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm">
                          Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchPayments(pagination.currentPage + 1)}
                          disabled={pagination.currentPage >= pagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                  <p className="text-muted-foreground">
                    {filters.search || filters.status !== 'all' 
                      ? 'No payments match your current filters.' 
                      : 'You have no payment history yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
