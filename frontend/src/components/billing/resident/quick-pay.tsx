"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  AlertTriangle, 
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  Zap
} from "lucide-react"
import { 
  getResidentBills,
  type Bill 
} from "@/lib/api/billing"

interface QuickPaySectionProps {
  onPayNow: (billId: string) => void
}

export function QuickPaySection({ onPayNow }: QuickPaySectionProps) {
  const [urgentBills, setUrgentBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUrgentBills()
  }, [])

  const fetchUrgentBills = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch overdue and due-soon bills
      const response = await getResidentBills({ 
        limit: 5, 
        status: 'unpaid,overdue,partially_paid' 
      })
      
      // Filter and sort by urgency
      const now = new Date()
      const urgent = response.data.bills
        .filter(bill => {
          const dueDate = new Date(bill.dueDate)
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return daysUntilDue <= 7 || bill.status === 'overdue' // Due within 7 days or overdue
        })
        .sort((a, b) => {
          // Sort by: overdue first, then by due date
          if (a.status === 'overdue' && b.status !== 'overdue') return -1
          if (b.status === 'overdue' && a.status !== 'overdue') return 1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
        .slice(0, 3) // Show top 3 urgent bills

      setUrgentBills(urgent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch urgent bills')
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

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyInfo = (bill: Bill) => {
    if (bill.status === 'overdue') {
      const daysOverdue = Math.abs(getDaysUntilDue(bill.dueDate))
      return {
        label: `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: AlertTriangle
      }
    }
    
    const daysUntilDue = getDaysUntilDue(bill.dueDate)
    if (daysUntilDue <= 0) {
      return {
        label: 'Due today',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: AlertTriangle
      }
    } else if (daysUntilDue <= 3) {
      return {
        label: `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: Clock
      }
    } else {
      return {
        label: `Due in ${daysUntilDue} days`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: Calendar
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Pay
          </CardTitle>
          <CardDescription>Your most urgent bills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading urgent bills...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Pay
          </CardTitle>
          <CardDescription>Your most urgent bills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUrgentBills} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Pay
        </CardTitle>
        <CardDescription>
          {urgentBills.length > 0 
            ? "Pay your most urgent bills with one click" 
            : "No urgent bills at the moment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {urgentBills.length > 0 ? (
          <div className="space-y-4">
            {urgentBills.map((bill) => {
              const urgencyInfo = getUrgencyInfo(bill)
              const IconComponent = urgencyInfo.icon
              const remainingAmount = bill.totalAmount - (bill.paidAmount || 0)
              
              return (
                <div 
                  key={bill._id} 
                  className={`p-4 rounded-lg border-2 ${urgencyInfo.bgColor} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{bill.billNumber}</h3>
                        <Badge variant="outline" className={`${urgencyInfo.color} border-current`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {urgencyInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bill Type</p>
                          <p className="font-medium">
                            {bill.billType.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Period</p>
                          <p className="font-medium">
                            {bill.billingPeriod.month}/{bill.billingPeriod.year}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount to Pay</p>
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(remainingAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button 
                        onClick={() => onPayNow(bill._id)}
                        className="h-12 px-6"
                        size="lg"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Pay All Button */}
            {urgentBills.length > 1 && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => {
                    // For now, just navigate to the first bill. 
                    // In a real app, you might want to implement bulk payment
                    onPayNow(urgentBills[0]._id)
                  }}
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Pay All Urgent Bills
                  <span className="ml-2 font-semibold">
                    {formatCurrency(
                      urgentBills.reduce((sum, bill) => 
                        sum + (bill.totalAmount - (bill.paidAmount || 0)), 0
                      )
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-800">All Caught Up!</h3>
            <p className="text-muted-foreground">
              You have no urgent bills to pay at the moment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
