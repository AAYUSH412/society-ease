"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, DollarSign, Calendar } from "lucide-react"

interface PaymentHistoryItem {
  _id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId?: string
  status: 'completed' | 'failed' | 'pending' | 'refunded'
  notes?: string
  processedBy?: string
}

interface PaymentHistoryTimelineProps {
  payments: PaymentHistoryItem[]
}

export function PaymentHistoryTimeline({ payments }: PaymentHistoryTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'refunded':
        return <XCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment history available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPayments.map((payment, index) => (
            <div key={payment._id} className="relative">
              {/* Timeline line */}
              {index < sortedPayments.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Status icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center">
                  {getStatusIcon(payment.status)}
                </div>
                
                {/* Payment details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{payment.paymentMethod}</span>
                    </div>
                    
                    {payment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono text-xs">{payment.transactionId}</span>
                      </div>
                    )}
                    
                    {payment.processedBy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processed By:</span>
                        <span>{payment.processedBy}</span>
                      </div>
                    )}
                    
                    {payment.notes && (
                      <div className="mt-2">
                        <p className="text-muted-foreground text-xs">Notes:</p>
                        <p className="text-xs bg-muted p-2 rounded mt-1">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Payments</p>
              <p className="font-semibold">{payments.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-semibold">
                ${payments.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
