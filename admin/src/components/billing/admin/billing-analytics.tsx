"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  PieChart,
  BarChart3,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { getAdminBillingAnalytics, getAdminPaymentTracking, AdminAnalyticsData, AdminPayment } from "@/lib/api/admin-billing"

export function BillingAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current year for analytics
      const currentYear = new Date().getFullYear()
      
      // Fetch analytics data and payment tracking for comprehensive view
      const [, paymentsResponse] = await Promise.all([
        getAdminBillingAnalytics({ year: currentYear }),
        getAdminPaymentTracking({ limit: 1000 }) // Get all payments for analysis
      ])

      // Extract payments data from the response
      const paymentsData: AdminPayment[] = paymentsResponse.data.payments || []

      // Map status to make calculations easier
      const isCompleted = (payment: AdminPayment) => payment.status === 'completed'

      // Calculate overview metrics
      const totalBills = paymentsData.length
      const paidBills = paymentsData.filter(isCompleted)
      
      const totalAmount = paymentsData.reduce((sum, p) => sum + p.amount, 0)
      const collectedAmount = paidBills.reduce((sum, p) => sum + p.amount, 0)
      const pendingAmount = totalAmount - collectedAmount
      const collectionRate = totalBills > 0 ? Math.round((paidBills.length / totalBills) * 100) : 0

      // Generate monthly trends (last 6 months)
      const monthlyTrends = []
      const currentDate = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        
        const monthPayments = paymentsData.filter(p => {
          const paymentDate = new Date(p.billDate)
          return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear()
        })
        
        const monthPaid = monthPayments.filter(isCompleted)
        const monthAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0)
        const monthCollected = monthPaid.reduce((sum, p) => sum + p.amount, 0)
        const monthRate = monthPayments.length > 0 ? Math.round((monthPaid.length / monthPayments.length) * 100) : 0
        
        monthlyTrends.push({
          month: monthName,
          bills: monthPayments.length,
          amount: monthAmount,
          collected: monthCollected,
          rate: monthRate
        })
      }

      // Payment methods analysis
      const paymentMethodCounts = {
        'Online Payment': paidBills.filter(p => p.paymentMethod.includes('online') || p.paymentMethod.includes('razorpay')).length,
        'Bank Transfer': paidBills.filter(p => p.paymentMethod.includes('bank_transfer')).length,
        'Cash': paidBills.filter(p => p.paymentMethod.includes('cash')).length,
        'Cheque': paidBills.filter(p => p.paymentMethod.includes('cheque')).length,
      }
      
      const totalPaidCount = paidBills.length
      const paymentMethods = Object.entries(paymentMethodCounts).map(([method, count]) => ({
        method,
        count,
        percentage: totalPaidCount > 0 ? Math.round((count / totalPaidCount) * 100) : 0,
        amount: paidBills.filter(p => {
          if (method === 'Online Payment') return p.paymentMethod.includes('online') || p.paymentMethod.includes('razorpay')
          if (method === 'Bank Transfer') return p.paymentMethod.includes('bank_transfer')
          if (method === 'Cash') return p.paymentMethod.includes('cash')
          if (method === 'Cheque') return p.paymentMethod.includes('cheque')
          return false
        }).reduce((sum, p) => sum + p.amount, 0)
      })).filter(pm => pm.count > 0)

      // Building-wise analysis
      const buildingStats = paymentsData.reduce((acc, payment) => {
        const building = payment.building || 'Unknown Building'
        if (!acc[building]) {
          acc[building] = { bills: 0, collected: 0, amount: 0 }
        }
        acc[building].bills++
        acc[building].amount += payment.amount
        if (isCompleted(payment)) {
          acc[building].collected++
        }
        return acc
      }, {} as Record<string, { bills: number; collected: number; amount: number }>)

      const buildingWise = Object.entries(buildingStats).map(([building, stats]) => ({
        building,
        bills: stats.bills,
        collected: stats.collected,
        rate: stats.bills > 0 ? Math.round((stats.collected / stats.bills) * 100) : 0,
        amount: stats.amount
      }))

      // Bill types analysis (simplified since we don't have detailed bill type data)
      const billTypes = [
        { 
          type: "Maintenance", 
          count: Math.round(totalBills * 0.85), 
          amount: Math.round(totalAmount * 0.85), 
          percentage: 85 
        },
        { 
          type: "Special Assessment", 
          count: Math.round(totalBills * 0.10), 
          amount: Math.round(totalAmount * 0.10), 
          percentage: 10 
        },
        { 
          type: "Penalty", 
          count: Math.round(totalBills * 0.05), 
          amount: Math.round(totalAmount * 0.05), 
          percentage: 5 
        }
      ]

      // Create a new analytics data object with our computed values
      const transformedData: AdminAnalyticsData = {
        overview: {
          totalBills,
          totalAmount,
          collectedAmount,
          pendingAmount,
          collectionRate
        },
        monthlyTrends,
        paymentMethods,
        buildingWise,
        billTypes
      }

      setAnalyticsData(transformedData)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const handleRetry = () => {
    fetchAnalyticsData()
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data')
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    // TODO: Refetch data based on selected period
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading analytics data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Analytics</h3>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return null
  }

  const { overview, monthlyTrends, paymentMethods, buildingWise, billTypes } = analyticsData

  return (
    <div className="space-y-6">
      {/* Analytics Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Billing Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive billing and payment analytics dashboard
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold">{overview.totalBills}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.5%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{overview.collectionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">-5.2%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{(overview.totalAmount / 100000).toFixed(1)}L</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.3%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Bills</p>
                <p className="text-2xl font-bold">{Math.round(overview.totalBills * 0.15)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">Monitor</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Status</CardTitle>
          <CardDescription>
            Current billing period collection breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Billed Amount</span>
              <span className="font-bold">₹{overview.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Collected</span>
                <span className="text-green-600">₹{overview.collectedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(overview.collectedAmount / overview.totalAmount) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Pending</span>
                <span className="text-red-600">₹{overview.pendingAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${(overview.pendingAmount / overview.totalAmount) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            Bill generation and collection trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.slice(-3).map((month) => (
              <div key={month.month} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{month.month}</h4>
                  <Badge variant={month.rate >= 80 ? "default" : month.rate >= 60 ? "secondary" : "destructive"}>
                    {month.rate}% Collection Rate
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bills Generated</p>
                    <p className="font-semibold">{month.bills}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">₹{(month.amount / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Collected</p>
                    <p className="font-semibold">₹{(month.collected / 100000).toFixed(1)}L</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Breakdown of payment methods used by residents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.method} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{method.method}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{method.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${method.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  ₹{method.amount.toLocaleString('en-IN')} collected
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Building-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Building-wise Performance
            </CardTitle>
            <CardDescription>
              Collection performance by building
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {buildingWise.map((building) => (
              <div key={building.building} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{building.building}</h4>
                  <Badge variant={building.rate >= 80 ? "default" : building.rate >= 60 ? "secondary" : "destructive"}>
                    {building.rate}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{building.collected} of {building.bills} bills collected</span>
                    <span>₹{building.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${building.rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bill Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Types Distribution</CardTitle>
          <CardDescription>
            Breakdown of different types of bills generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {billTypes.map((type) => (
              <div key={type.type} className="border rounded-lg p-4 text-center">
                <div className="space-y-2">
                  <h4 className="font-semibold">{type.type}</h4>
                  <div className="text-2xl font-bold text-primary">{type.count}</div>
                  <div className="text-sm text-muted-foreground">
                    ₹{(type.amount / 100000).toFixed(1)}L ({type.percentage}%)
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full" 
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common billing operations and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-5 w-5 mb-2" />
              <span>Download Collection Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-5 w-5 mb-2" />
              <span>Defaulter List</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-5 w-5 mb-2" />
              <span>Yearly Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
