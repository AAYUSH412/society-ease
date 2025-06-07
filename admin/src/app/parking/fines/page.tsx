"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { FineManagement, FineStatsCards, FineFilters, PaymentRecordsTable } from "@/components/parking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, FileText, DollarSign, CreditCard, AlertTriangle, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getAllFines, getFineAnalytics, exportFines, type ViolationFine } from "@/lib/api/parking/fines"
import { toast } from "sonner"

interface FineOverview {
  totalFines: number
  total: number
  pending: number
  paid: number
  overdue: number
  waived: number
  disputed: number
  totalAmount: number
  collectedAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
  collectionRate: number
  averageFine: number
  averageFineAmount: number
  monthlyTrend: number
  todayCollections: number
}

export default function FinesPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State management
  const [overview, setOverview] = useState<FineOverview | null>(null)
  const [fines, setFines] = useState<ViolationFine[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    violationType: "",
    residentId: "",
    dateRange: undefined as {from: Date, to: Date} | undefined,
    amountRange: { min: 0, max: 10000 },
  })
  const [activeTab, setActiveTab] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  // Load fines data
  const loadFinesData = useCallback(async () => {
    try {
      setLoading(true)
      const [finesResponse, analyticsResponse] = await Promise.all([
        getAllFines({
          status: filters.status || undefined,
          paymentStatus: filters.paymentStatus || undefined,
          amountMin: filters.amountRange.min,
          amountMax: filters.amountRange.max,
          issuedDateFrom: filters.dateRange?.from?.toISOString(),
          issuedDateTo: filters.dateRange?.to?.toISOString(),
          search: filters.search || undefined,
        }),
        getFineAnalytics()
      ])
      
      if (finesResponse.success) {
        setFines(finesResponse.data?.fines || [])
      }
      
      if (analyticsResponse.success) {
        const stats = analyticsResponse.data.overview
        setOverview({
          totalFines: stats.total,
          total: stats.total,
          pending: stats.pending,
          paid: stats.paid,
          overdue: stats.overdue,
          waived: stats.waived,
          disputed: stats.disputed,
          totalAmount: stats.totalAmount,
          collectedAmount: stats.collectedAmount,
          paidAmount: stats.collectedAmount,
          pendingAmount: stats.pendingAmount,
          overdueAmount: stats.overdueAmount,
          collectionRate: stats.collectionRate,
          averageFine: stats.averageFineAmount,
          averageFineAmount: stats.averageFineAmount,
          monthlyTrend: 15, // Mock data
          todayCollections: 2500 // Mock data
        })
      }
    } catch (error) {
      console.error("Error loading fines data:", error)
      toast.error("Failed to load fines data")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadFinesData()
  }, [loadFinesData])

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    try {
      setIsExporting(true)
      const blob = await exportFines({
        ...filters,
        format,
        includePaymentHistory: true
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fines-report-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Report exported successfully`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export fines report")
    } finally {
      setIsExporting(false)
    }
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Update filters based on tab
    const statusMap: Record<string, string> = {
      "all": "",
      "pending": "pending",
      "paid": "paid",
      "overdue": "overdue",
      "disputed": "disputed",
      "waived": "waived"
    }
    
    setFilters(prev => ({
      ...prev,
      status: statusMap[tab] || ""
    }))
  }

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Loading Fines..." description="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole="admin"
      userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
      userEmail={user?.email || ""}
      notifications={overview?.overdue || 0}
    >
      <DashboardContent
        title="Fine Management"
        description="Manage and track parking violation fines and payments"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/parking")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Overview Stats */}
          <FineStatsCards stats={overview} />

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fines Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    ₹{overview?.totalAmount.toLocaleString() || 0} Total
                  </Badge>
                  <Badge variant="default">
                    ₹{overview?.collectedAmount.toLocaleString() || 0} Collected
                  </Badge>
                  {overview?.overdue && overview.overdue > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {overview.overdue} Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">
                    All
                    <Badge variant="secondary" className="ml-2">
                      {fines.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Pending
                    <Badge variant="destructive" className="ml-2">
                      {overview?.pending || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="paid">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Paid
                    <Badge variant="default" className="ml-2">
                      {fines.filter(f => f.status === "paid").length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="overdue">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Overdue
                    <Badge variant="destructive" className="ml-2">
                      {overview?.overdue || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="disputed">
                    <FileText className="h-4 w-4 mr-1" />
                    Disputed
                    <Badge variant="secondary" className="ml-2">
                      {fines.filter(f => f.status === "disputed").length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="waived">
                    Waived
                    <Badge variant="secondary" className="ml-2">
                      {fines.filter(f => f.status === "waived").length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Filters */}
                  <FineFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={() => setFilters({
                      search: "",
                      status: "",
                      paymentStatus: "",
                      violationType: "",
                      residentId: "",
                      dateRange: undefined,
                      amountRange: { min: 0, max: 10000 },
                    })}
                  />

                  {/* Fines Content */}
                  <div className="mt-6">
                    <TabsContent value={activeTab} className="mt-0">
                      <FineManagement />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Collection Performance */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                      <p className="text-2xl font-bold">{overview.collectionRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{overview.collectedAmount.toLocaleString()} of ₹{overview.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Today&apos;s Collections</p>
                      <p className="text-2xl font-bold">₹{overview.todayCollections.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {overview.monthlyTrend > 0 ? '+' : ''}{overview.monthlyTrend}% from last month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Outstanding Amount</p>
                      <p className="text-2xl font-bold">₹{overview.overdueAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {overview.overdue} overdue fine{overview.overdue !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Payment Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payment Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentRecordsTable 
                records={[]}
                selectedRecords={[]}
                onSelectionChange={() => {}}
                onViewDetails={() => {}}
                onDownloadReceipt={() => {}}
                onResendReceipt={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
