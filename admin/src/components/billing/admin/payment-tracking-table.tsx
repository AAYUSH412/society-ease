"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  Download, 
  Eye, 
  Mail, 
  Building,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RefreshCw,
  DollarSign
} from "lucide-react"
import { getAdminPaymentTracking, AdminPayment } from "@/lib/api/admin-billing"
import { ManualPaymentDialog } from "./manual-payment-dialog"

interface Payment {
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

// Transform AdminPayment to local Payment format
const transformPaymentData = (adminPayment: AdminPayment): Payment => {
  // Map backend status to frontend status
  const statusMap: Record<string, 'paid' | 'unpaid' | 'partially_paid' | 'overdue'> = {
    'completed': 'paid',
    'pending': 'unpaid',
    'failed': 'unpaid',
    'refunded': 'unpaid'
  }

  // Map backend payment method to frontend payment method
  const methodMap: Record<string, 'online' | 'cash' | 'cheque' | 'bank_transfer' | undefined> = {
    'razorpay_upi': 'online',
    'razorpay_card': 'online',
    'razorpay_netbanking': 'online',
    'bank_transfer': 'bank_transfer',
    'cash': 'cash',
    'cheque': 'cheque'
  }

  return {
    id: adminPayment.id,
    billId: adminPayment.billId,
    billNumber: adminPayment.billNumber,
    flatNumber: adminPayment.flatNumber,
    building: adminPayment.building || '',
    residentName: adminPayment.residentName,
    amount: adminPayment.amount,
    status: statusMap[adminPayment.status] || 'unpaid',
    paymentMethod: methodMap[adminPayment.paymentMethod],
    paymentDate: adminPayment.paymentDate,
    dueDate: adminPayment.dueDate,
    billDate: adminPayment.billDate,
    transactionId: adminPayment.transactionId,
    lateFeePenalty: adminPayment.lateFeePenalty
  }
}

const STATUS_CONFIG = {
  paid: { label: "Paid", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
  unpaid: { label: "Unpaid", variant: "secondary" as const, icon: Clock, color: "text-gray-600" },
  partially_paid: { label: "Partial", variant: "outline" as const, icon: AlertTriangle, color: "text-yellow-600" },
  overdue: { label: "Overdue", variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
} as const

export function PaymentTrackingTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [buildingFilter, setBuildingFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getAdminPaymentTracking({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined
      })

      if (response.success) {
        const transformedPayments = response.data.payments.map(transformPaymentData)
        setPayments(transformedPayments)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, statusFilter])

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, buildingFilter, searchTerm])

  // Get unique buildings
  const buildings = Array.from(new Set(payments.map(p => p.building)))

  // Filter payments locally (for search and building filter since API handles status filter)
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBuilding = buildingFilter === "all" || payment.building === buildingFilter
    
    return matchesSearch && matchesBuilding
  })

  // Use filtered payments for display
  const displayPayments = filteredPayments

  // Summary stats
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    unpaid: payments.filter(p => p.status === 'unpaid').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    collectedAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  }

  const handleSendReminder = async (paymentId: string) => {
    // TODO: Implement API call to send reminder
    console.log('Sending reminder for payment:', paymentId)
  }

  const handleRetry = () => {
    fetchPayments()
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading payment data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Payment Data</h3>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
              <Button onClick={handleRetry} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unpaid}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Collection Status</p>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{stats.collectedAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">Collected</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-600">
                    ₹{stats.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">Total</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold">
                {Math.round((stats.collectedAmount / (stats.totalAmount || 1)) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracking</CardTitle>
          <CardDescription>
            Track and manage bill payments from residents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by flat, resident, or bill number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building || 'unknown'} value={building || 'unknown'}>
                    {building || 'Unknown Building'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1 p-4">
              {displayPayments.length > 0 ? (
                displayPayments.map((payment) => {
                  const statusConfig = STATUS_CONFIG[payment.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <Card key={payment.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {payment.flatNumber}
                                </Badge>
                                <Badge variant="secondary">
                                  <Building className="h-3 w-3 mr-1" />
                                  {payment.building}
                                </Badge>
                                <Badge 
                                  variant={statusConfig.variant}
                                  className={`${statusConfig.color}`}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <h4 className="font-medium">{payment.residentName}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Bill: {payment.billNumber}</span>
                                <span>₹{(payment.amount || 0).toLocaleString('en-IN')}</span>
                                <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                                {payment.paymentDate && (
                                  <span className="text-green-600">
                                    Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {payment.paymentMethod && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Payment Method: </span>
                                  <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                                  {payment.transactionId && (
                                    <span className="text-muted-foreground ml-2">
                                      • {payment.transactionId}
                                    </span>
                                  )}
                                </div>
                              )}
                              {payment.lateFeePenalty && (
                                <div className="text-sm text-red-600">
                                  Late Fee: ₹{payment.lateFeePenalty.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {payment.status === 'unpaid' || payment.status === 'overdue' ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleSendReminder(payment.id)}
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Remind
                                </Button>
                                <ManualPaymentDialog
                                  payment={{
                                    id: payment.id,
                                    billId: payment.billId,
                                    billNumber: payment.billNumber,
                                    flatNumber: payment.flatNumber,
                                    building: payment.building,
                                    residentName: payment.residentName,
                                    amount: payment.amount || 0,
                                    status: payment.status,
                                    dueDate: payment.dueDate
                                  }}
                                  onSuccess={() => fetchPayments()}
                                >
                                  <Button size="sm">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Record Payment
                                  </Button>
                                </ManualPaymentDialog>
                              </>
                            ) : (
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No matching payments found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Try adjusting your search or filters to find what you&apos;re looking for
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages} • {displayPayments.length} payments displayed
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
