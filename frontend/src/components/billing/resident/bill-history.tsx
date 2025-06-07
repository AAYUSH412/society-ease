"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Download, 
  CreditCard, 
  Search,
  Loader2,
  Eye
} from "lucide-react"
import { 
  getResidentBills, 
  downloadBillPDF,
  type Bill 
} from "@/lib/api/billing"
import { BillDetailsModal } from "./bill-details-modal"

interface BillHistoryProps {
  onPayNow: (billId: string) => void
  limit?: number
  showFilters?: boolean
}

export function BillHistory({ onPayNow, limit = 10, showFilters = true }: BillHistoryProps) {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    status: 'all',
    search: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBills: 0
  })

  const fetchBills = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params: {
        page: number
        limit: number
        year: number
        status?: string
      } = {
        page,
        limit: limit,
        year: parseInt(filters.year)
      }

      if (filters.status !== 'all') {
        params.status = filters.status
      }

      const response = await getResidentBills(params)
      setBills(response.data.bills)
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalBills: response.data.pagination.totalBills
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bills')
      console.error('Error fetching bills:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, limit])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  const handleDownloadBill = async (billId: string) => {
    try {
      const blob = await downloadBillPDF(billId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bill-${billId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading bill:', error)
    }
  }

  const handleViewDetails = (bill: Bill) => {
    setSelectedBill(bill)
    setDetailsModalOpen(true)
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
      day: 'numeric'
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

  // Filter bills based on search term
  const filteredBills = bills.filter(bill => {
    if (!filters.search) return true
    return (
      bill.billNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.billType.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.flatNumber.toLowerCase().includes(filters.search.toLowerCase())
    )
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bill History
          </CardTitle>
          <CardDescription>
            View and manage all your bills and payment history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by bill number, type, or flat..."
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
              <Button onClick={() => fetchBills()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Bills List */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredBills.length > 0 ? (
                <>
                  {filteredBills.map((bill) => (
                    <Card key={bill._id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{bill.billNumber}</h3>
                              <Badge className={getStatusColor(bill.status)}>
                                {bill.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p className="font-medium text-foreground">Bill Type</p>
                                <p>{bill.billType.replace('_', ' ').toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Period</p>
                                <p>{bill.billingPeriod.month}/{bill.billingPeriod.year}</p>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Due Date</p>
                                <p>{formatDate(bill.dueDate)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Amount</p>
                                <p className="font-semibold text-lg text-primary">
                                  {formatCurrency(bill.totalAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(bill)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadBill(bill._id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {bill.status !== 'paid' && (
                              <Button
                                size="sm"
                                onClick={() => onPayNow(bill._id)}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredBills.length} of {pagination.totalBills} bills
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchBills(pagination.currentPage - 1)}
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
                          onClick={() => fetchBills(pagination.currentPage + 1)}
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
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bills Found</h3>
                  <p className="text-muted-foreground">
                    {filters.search || filters.status !== 'all' 
                      ? 'No bills match your current filters.' 
                      : 'You have no bills for the selected year.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Details Modal */}
      <BillDetailsModal
        bill={selectedBill}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onPayNow={onPayNow}
        onDownload={handleDownloadBill}
      />
    </div>
  )
}
