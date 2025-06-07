"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { 
  Calendar,
  IndianRupee,
  FileText,
  Download,
  CreditCard,
  Building,
  User,
  Clock,
  Receipt
} from "lucide-react"
import { type Bill } from "@/lib/api/billing"

interface BillDetailsModalProps {
  bill: Bill | null
  isOpen: boolean
  onClose: () => void
  onPayNow: (billId: string) => void
  onDownload: (billId: string) => void
}

export function BillDetailsModal({ 
  bill, 
  isOpen, 
  onClose, 
  onPayNow, 
  onDownload 
}: BillDetailsModalProps) {
  if (!bill) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
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

  const remainingAmount = bill.totalAmount - (bill.paidAmount || 0)
  const isPaid = bill.status === 'paid'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bill Details - {bill.billNumber}
          </DialogTitle>
          <DialogDescription>
            Complete details of your bill for {bill.billingPeriod.month}/{bill.billingPeriod.year}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Bill Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Bill Overview
                </span>
                <Badge className={getStatusColor(bill.status)}>
                  {bill.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Flat Number</p>
                    <p className="text-sm text-muted-foreground">{bill.flatNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Building</p>
                    <p className="text-sm text-muted-foreground">{bill.building || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Bill Period</p>
                    <p className="text-sm text-muted-foreground">
                      {bill.billingPeriod.month}/{bill.billingPeriod.year}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Generated Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(bill.generatedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(bill.dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Bill Type</p>
                    <p className="text-sm text-muted-foreground">
                      {bill.billType.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Amount Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Amount</span>
                  <span>{formatCurrency(bill.amount.baseAmount)}</span>
                </div>
                {bill.amount.taxes > 0 && (
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>{formatCurrency(bill.amount.taxes)}</span>
                  </div>
                )}
                {bill.amount.lateFee > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Fee</span>
                    <span>{formatCurrency(bill.amount.lateFee)}</span>
                  </div>
                )}
                {bill.amount.otherCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Other Charges</span>
                    <span>{formatCurrency(bill.amount.otherCharges)}</span>
                  </div>
                )}
                {bill.amount.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(bill.amount.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(bill.totalAmount)}</span>
                </div>
                {(bill.paidAmount ?? 0) > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paid Amount</span>
                      <span>{formatCurrency(bill.paidAmount ?? 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-red-600">
                      <span>Remaining Amount</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => onDownload(bill._id)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Bill
            </Button>
            {!isPaid && remainingAmount > 0 && (
              <Button
                onClick={() => onPayNow(bill._id)}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {formatCurrency(remainingAmount)}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
