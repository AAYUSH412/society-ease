"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ResidentBillingSummary } from "@/components/billing/resident/billing-summary"
import { QuickPaySection } from "@/components/billing/resident/quick-pay"
import { BillHistory } from "@/components/billing/resident/bill-history"
import { PaymentHistory } from "@/components/billing/resident/payment-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  FileText,
  Download,
  Home,
  Receipt,
  History
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function BillingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handlePayNow = (billId: string) => {
    router.push(`/resident/billing/pay/${billId}`)
  }

  return (
    <DashboardLayout
      userName={user?.firstName ? `${user.firstName} ${user.lastName}` : "Resident"}
      userEmail={user?.email || "resident@email.com"}
      notifications={2}
    >
      <DashboardContent
        title="Billing & Payments"
        description="Manage your bills, payments, and view financial history"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("payment-history")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Payment History
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("bills")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Bills
            </Button>
            <Button 
              size="sm"
              onClick={() => setActiveTab("quick-pay")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Quick Pay
            </Button>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quick-pay" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Quick Pay
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Bill History
            </TabsTrigger>
            <TabsTrigger value="payment-history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ResidentBillingSummary key={refreshKey} onRefresh={handleRefresh} />
            <div className="grid gap-6 lg:grid-cols-2">
              <QuickPaySection onPayNow={handlePayNow} />
              <div className="space-y-6">
                <BillHistory 
                  key={refreshKey} 
                  onPayNow={handlePayNow} 
                  limit={5} 
                  showFilters={false}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quick-pay">
            <QuickPaySection onPayNow={handlePayNow} />
          </TabsContent>

          <TabsContent value="bills">
            <BillHistory key={refreshKey} onPayNow={handlePayNow} />
          </TabsContent>

          <TabsContent value="payment-history">
            <PaymentHistory key={refreshKey} />
          </TabsContent>
        </Tabs>
      </DashboardContent>
    </DashboardLayout>
  )
}
