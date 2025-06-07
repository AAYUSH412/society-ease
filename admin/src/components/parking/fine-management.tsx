"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  FileText,
  Download,
  MoreHorizontal,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Search,
  Plus
} from 'lucide-react'
import { getAllFines, recordPayment, waiveFine, sendPaymentReminder, type ViolationFine, type PaymentRecordRequest } from '@/lib/api/parking/fines'

// Utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface FineStats {
  totalFines: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
  collectionRate: number
}

export function FineManagement() {
  const [fines, setFines] = useState<ViolationFine[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFines, setSelectedFines] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: null as {from: Date, to: Date} | null,
    search: ''
  })
  const [stats, setStats] = useState<FineStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [activeTab, setActiveTab] = useState('all')
  const [selectedFine, setSelectedFine] = useState<ViolationFine | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showWaiverDialog, setShowWaiverDialog] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: '' as 'online' | 'cash' | 'cheque' | 'bank_transfer',
    paymentReference: '',
    adminNotes: ''
  })

  const getStatusFromTab = (tab: string) => {
    switch (tab) {
      case 'pending': return 'pending'
      case 'paid': return 'paid'
      case 'overdue': return 'overdue'
      case 'waived': return 'waived'
      default: return undefined
    }
  }

  const loadFines = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAllFines({
        page: pagination.page,
        limit: pagination.limit,
        status: getStatusFromTab(activeTab),
        paymentStatus: filters.paymentStatus || undefined,
        search: filters.search || undefined,
        issuedDateFrom: filters.dateRange?.from?.toISOString(),
        issuedDateTo: filters.dateRange?.to?.toISOString()
      })

      setFines(response.data.fines)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalFines,
        totalPages: response.data.pagination.totalPages
      }))
    } catch (error) {
      console.error('Failed to load fines:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, activeTab, filters.paymentStatus, filters.search, filters.dateRange])

  const loadStats = useCallback(async () => {
    try {
      // Calculate stats from current fines data
      const totalFines = fines.length
      const totalAmount = fines.reduce((sum, fine) => sum + fine.totalAmount, 0)
      const paidAmount = fines
        .filter(fine => fine.paymentStatus === 'paid')
        .reduce((sum, fine) => sum + fine.totalAmount, 0)
      const pendingAmount = fines
        .filter(fine => fine.paymentStatus === 'unpaid')
        .reduce((sum, fine) => sum + fine.totalAmount, 0)
      const overdueAmount = fines
        .filter(fine => fine.status === 'overdue')
        .reduce((sum, fine) => sum + fine.totalAmount, 0)
      const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

      setStats({
        totalFines,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        collectionRate
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [fines])

  useEffect(() => {
    loadFines()
    loadStats()
  }, [loadFines, loadStats])

  const handleRecordPayment = async (paymentData: PaymentRecordRequest) => {
    if (!selectedFine) return

    try {
      await recordPayment(selectedFine._id, paymentData)
      setShowPaymentDialog(false)
      setSelectedFine(null)
      await loadFines()
    } catch (error) {
      console.error('Failed to record payment:', error)
    }
  }

  const handleWaiveFine = async (reason: string) => {
    if (!selectedFine) return

    try {
      await waiveFine(selectedFine._id, { reason })
      setShowWaiverDialog(false)
      setSelectedFine(null)
      await loadFines()
    } catch (error) {
      console.error('Failed to waive fine:', error)
    }
  }

  const handleSendReminder = async (fineId: string) => {
    try {
      await sendPaymentReminder(fineId, {
        type: 'first',
        customMessage: 'Please pay your outstanding fine to avoid additional charges.'
      })
    } catch (error) {
      console.error('Failed to send reminder:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'waived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'disputed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fine Management</h2>
          <p className="text-muted-foreground">
            Track, collect, and manage violation fines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadFines()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Issue Fine
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFines}</div>
              <p className="text-xs text-muted-foreground">
                All time violations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                All fines combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Successfully collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.collectionRate.toFixed(1)}%</div>
              <Progress value={stats.collectionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fines</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fines..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8 w-64"
                />
              </div>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Payments</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Fines</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="waived">Waived</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedFines.length === fines.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFines(fines.map(f => f._id))
                            } else {
                              setSelectedFines([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Fine ID</TableHead>
                      <TableHead>Resident</TableHead>
                      <TableHead>Violation</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : fines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No fines found
                        </TableCell>
                      </TableRow>
                    ) : (
                      fines.map((fine) => (
                        <TableRow key={fine._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedFines.includes(fine._id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedFines(prev => [...prev, fine._id])
                                } else {
                                  setSelectedFines(prev => prev.filter(id => id !== fine._id))
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{fine.fineId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fine.resident.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {fine.resident.flatNumber}
                                {fine.resident.building && `, ${fine.resident.building}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fine.violation.category}</div>
                              <div className="text-sm text-muted-foreground">{fine.violation.location}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatCurrency(fine.totalAmount)}</div>
                              {fine.lateFee > 0 && (
                                <div className="text-sm text-red-600">
                                  +{formatCurrency(fine.lateFee)} late fee
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(fine.status)}>
                              {fine.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className={new Date(fine.dueDate) < new Date() && fine.status !== 'paid' ? 'text-red-600' : ''}>
                              {formatDate(fine.dueDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedFine(fine)
                                  setPaymentForm({
                                    amount: fine.totalAmount,
                                    paymentMethod: 'cash',
                                    paymentReference: '',
                                    adminNotes: ''
                                  })
                                  setShowPaymentDialog(true)
                                }}>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Record Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendReminder(fine._id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedFine(fine)
                                  setShowWaiverDialog(true)
                                }}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Waive Fine
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for fine {selectedFine?.fineId}
            </DialogDescription>
          </DialogHeader>
          {/* Payment form content */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleRecordPayment(paymentForm)}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waiver Dialog */}
      <Dialog open={showWaiverDialog} onOpenChange={setShowWaiverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Fine</DialogTitle>
            <DialogDescription>
              Waive fine {selectedFine?.fineId}
            </DialogDescription>
          </DialogHeader>
          {/* Waiver form content */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWaiverDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleWaiveFine('')}>
              Waive Fine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
