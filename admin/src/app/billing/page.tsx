"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminBillingOverview } from "@/components/billing/admin/admin-billing-overview"
import { BillCreationWizard } from "@/components/billing/admin/bill-creation-wizard"
import { PaymentTrackingTable } from "@/components/billing/admin/payment-tracking-table"
import { BillingAnalytics } from "@/components/billing/admin/billing-analytics"
import { Plus, Receipt, TrendingUp, Users } from "lucide-react"

export default function AdminBillingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [showWizard, setShowWizard] = useState(false)

  return (
    <DashboardLayout
      userRole="admin"
      userName="Admin User"
      userEmail="admin@societyease.com"
      notifications={5}
    >
      <DashboardContent
        title="Billing Management"
        description="Manage society bills, payments, and billing operations"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/billing/reports')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bills
            </Button>
          </div>
        }
      >
        {showWizard ? (
          <BillCreationWizard 
            onClose={() => setShowWizard(false)}
            onComplete={() => {
              setShowWizard(false)
              setActiveTab("overview")
            }}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Payment Tracking
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminBillingOverview onCreateBills={() => setShowWizard(true)} />
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <PaymentTrackingTable />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <BillingAnalytics />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Settings</CardTitle>
                  <CardDescription>
                    Configure billing preferences and default values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Settings panel coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DashboardContent>
    </DashboardLayout>
  )
}
