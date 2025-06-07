"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  MoreHorizontal, 
  Download, 
  Eye, 
  DollarSign, 
  Send, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard
} from "lucide-react"

interface PaymentRecord {
  _id: string
  fineId: string
  paymentId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId?: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  fine: {
    violationId: string
    violationType: string
    resident: {
      name: string
      flatNumber: string
      building?: string
    }
  }
  processedBy?: {
    name: string
    role: string
  }
  notes?: string
  receipt?: {
    url: string
    filename: string
  }
}

interface PaymentRecordsTableProps {
  records: PaymentRecord[]
  loading?: boolean
  selectedRecords: string[]
  onSelectionChange: (selected: string[]) => void
  onViewDetails: (record: PaymentRecord) => void
  onDownloadReceipt: (record: PaymentRecord) => void
  onResendReceipt: (record: PaymentRecord) => void
}

export function PaymentRecordsTable({
  records,
  loading = false,
  selectedRecords,
  onSelectionChange,
  onViewDetails,
  onDownloadReceipt,
  onResendReceipt,
}: PaymentRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <DollarSign className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.fine.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fine.violationType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredRecords.map(r => r._id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRecords, recordId])
    } else {
      onSelectionChange(selectedRecords.filter(id => id !== recordId))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading payment records...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded animate-pulse">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Records ({filteredRecords.length})</CardTitle>
            <CardDescription>
              Track all fine payments and transaction history
            </CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <Input
              id="search"
              placeholder="Search by resident, payment ID, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="status-filter" className="sr-only">Filter by status</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredRecords.length > 0 &&
                      filteredRecords.every(r => selectedRecords.includes(r._id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Payment Details</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Violation</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record._id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.includes(record._id)}
                      onCheckedChange={(checked) =>
                        handleSelectRecord(record._id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(record.paymentMethod)}
                        <span className="font-medium">{record.paymentId}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.paymentMethod.replace('_', ' ').toUpperCase()}
                        {record.transactionId && (
                          <span className="ml-2">• {record.transactionId}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.fine.resident.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.fine.resident.flatNumber}
                        {record.fine.resident.building && `, ${record.fine.resident.building}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{record.fine.violationType.replace('_', ' ')}</div>
                      <div className="text-muted-foreground">
                        ID: {record.fine.violationId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(record.amount)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(record.paymentDate)}
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(record)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {record.receipt && (
                          <DropdownMenuItem onClick={() => onDownloadReceipt(record)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onResendReceipt(record)}>
                          <Send className="h-4 w-4 mr-2" />
                          Resend Receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No payment records found</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
