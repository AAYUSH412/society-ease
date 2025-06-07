"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Calendar,
  Receipt,
  AlertTriangle,
  CheckCircle,
  FileText
} from "lucide-react"
import { 
  getBillingSummary, 
  type BillingSummary,
  type Bill
} from "@/lib/api/billing"

interface BillingSummaryCardProps {
  summary?: BillingSummary
  recentBills?: Bill[]
  onRefresh: () => void
}

export function ResidentBillingSummary({ 
  summary, 
  recentBills = [], 
  onRefresh 
}: BillingSummaryCardProps) {
  const [loading, setLoading] = useState(!summary)
  const [error, setError] = useState<string | null>(null)
  const [localSummary, setLocalSummary] = useState<BillingSummary | null>(summary || null)

  useEffect(() => {
    if (!summary) {
      fetchSummary()
    }
  }, [summary])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const summaryData = await getBillingSummary()
      setLocalSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary')
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

  const calculatePaymentRate = () => {
    if (!localSummary) return 0
    const total = localSummary.totalPaid + localSummary.totalPending
    if (total === 0) return 0
    return Math.round((localSummary.totalPaid / total) * 100)
  }

  const paymentRate = calculatePaymentRate()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading summary...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSummary} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!localSummary) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No billing summary available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Pending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(localSummary.totalPending)}
          </div>
          <p className="text-xs text-muted-foreground">
            {localSummary.overdueBills > 0 && (
              <span className="text-red-500">
                {localSummary.overdueBills} overdue bill{localSummary.overdueBills > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Total Paid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(localSummary.totalPaid)}
          </div>
          <p className="text-xs text-muted-foreground">
            This year
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Dues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Dues</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(localSummary.upcomingDues)}
          </div>
          <p className="text-xs text-muted-foreground">
            Next 30 days
          </p>
        </CardContent>
      </Card>

      {/* Payment Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          <TrendingUp className={`h-4 w-4 ${paymentRate >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {paymentRate}%
          </div>
          <Progress value={paymentRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {paymentRate >= 80 ? 'Excellent' : paymentRate >= 60 ? 'Good' : 'Needs improvement'}
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Bills Summary
          </CardTitle>
          <CardDescription>
            Overview of your recent billing activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBills.length > 0 ? (
            <div className="space-y-4">
              {recentBills.slice(0, 3).map((bill) => (
                <div key={bill._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{bill.billNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {bill.billType.replace('_', ' ')} • {bill.billingPeriod.month}/{bill.billingPeriod.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(bill.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(bill.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <Badge
                      variant={bill.status === 'paid' ? 'default' : 'destructive'}
                      className={
                        bill.status === 'paid' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : bill.status === 'overdue'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }
                    >
                      {bill.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentBills.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    View All Bills
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Bills</h3>
              <p className="text-muted-foreground">
                Your recent bills will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
