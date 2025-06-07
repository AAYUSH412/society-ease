"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { FineDetailsCard } from "@/components/parking/fine-details-card"
import { PaymentHistoryTimeline } from "@/components/parking/payment-history-timeline"
import { FineActions } from "@/components/parking/fine-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Car, Calendar, MapPin, User, AlertTriangle, FileText } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { 
  getFineDetails, 
  updateFineStatus, 
  recordPayment, 
  addFineNote,
  sendPaymentReminder,
  ViolationFine 
} from "@/lib/api/parking/fines"
import { toast } from "sonner"

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

export default function FineDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  
  // State management
  const [fine, setFine] = useState<ViolationFine | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load fine details
  const loadFineDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getFineDetails(params.id)
      
      if (response.success) {
        setFine(response.data.fine)
        
        // Transform payment history to match component interface
        const transformedPaymentHistory: PaymentHistoryItem[] = (response.data.paymentHistory || []).map((payment, index) => ({
          _id: `payment_${index}`,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paymentDate: payment.paymentDate,
          transactionId: payment.reference,
          status: payment.status === "success" ? "completed" : payment.status as "pending" | "failed" | "refunded" | "completed",
          processedBy: user?._id || "system",
          notes: ""
        }))
        setPaymentHistory(transformedPaymentHistory)
      } else {
        toast.error(response.message || "Failed to load fine details")
      }
    } catch (error) {
      console.error("Error loading fine details:", error)
      toast.error("Failed to load fine details")
    } finally {
      setLoading(false)
    }
  }, [params.id, user?._id])

  useEffect(() => {
    loadFineDetails()
  }, [loadFineDetails])

  // Handle status update
  const handleStatusUpdate = async (status: string, notes?: string) => {
    if (!fine) return

    try {
      const response = await updateFineStatus(
        params.id, 
        status as ViolationFine['status'], 
        notes
      )
      
      if (response.success) {
        toast.success("Fine status updated successfully")
        loadFineDetails()
      } else {
        toast.error(response.message || "Failed to update fine status")
      }
    } catch (error) {
      console.error("Error updating fine status:", error)
      toast.error("Failed to update fine status")
    }
  }

  // Handle payment recording
  const handlePaymentRecord = async (amount: number, method: string, notes?: string) => {
    if (!fine) return

    try {
      const response = await recordPayment(params.id, {
        amount,
        paymentMethod: method as "online" | "cash" | "cheque" | "bank_transfer",
        paymentReference: undefined,
        adminNotes: notes,
        paymentDate: new Date().toISOString()
      })
      
      if (response.success) {
        toast.success("Payment recorded successfully")
        loadFineDetails()
      } else {
        toast.error(response.message || "Failed to record payment")
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      toast.error("Failed to record payment")
    }
  }

  // Handle note addition
  const handleAddNote = async (note: string) => {
    if (!fine || !user) return

    try {
      const response = await addFineNote(params.id, {
        note,
        type: "internal",
        addedBy: user._id,
        addedAt: new Date().toISOString()
      })
      
      if (response.success) {
        toast.success("Note added successfully")
        loadFineDetails()
      } else {
        toast.error(response.message || "Failed to add note")
      }
    } catch (error) {
      console.error("Error adding note:", error)
      toast.error("Failed to add note")
    }
  }

  // Handle send reminder
  const handleSendReminder = async () => {
    if (!fine) return

    try {
      const response = await sendPaymentReminder(params.id, {
        type: "first",
        customMessage: "Your parking fine payment is due. Please pay at your earliest convenience."
      })
      
      if (response.success) {
        toast.success("Payment reminder sent successfully")
      } else {
        toast.error(response.message || "Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast.error("Failed to send reminder")
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Fine Details">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading fine details...</p>
            </div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  if (!fine) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Fine Not Found">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Fine Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The fine you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => router.push("/parking/fines")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fines
              </Button>
            </div>
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
      notifications={0}
    >
      <DashboardContent title={`Fine Details - ${fine.fineId}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/parking/fines")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Fine Details</h1>
                <p className="text-muted-foreground">
                  Fine ID: {fine.fineId}
                </p>
              </div>
            </div>
            <Badge 
              variant={fine.status === "paid" ? "default" : "destructive"}
              className="text-sm"
            >
              {fine.status.toUpperCase()}
            </Badge>
          </div>

          {/* Fine Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Fine Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Violation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Violation Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{fine.violation.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{fine.violation.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(fine.violation.incidentDateTime).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {fine.violation.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Resident Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{fine.resident.name}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {fine.resident.building && `${fine.resident.building} - `}
                        Flat {fine.resident.flatNumber}
                      </p>
                      <p className="text-muted-foreground">{fine.resident.email}</p>
                      <p className="text-muted-foreground">{fine.resident.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div>
                <h3 className="font-semibold mb-4">Financial Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Base Fine</p>
                    <p className="font-semibold">₹{fine.fineAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Late Fee</p>
                    <p className="font-semibold">₹{fine.lateFee}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">₹{fine.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid Amount</p>
                    <p className="font-semibold">₹{fine.paidAmount}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Important Dates */}
              <div>
                <h3 className="font-semibold mb-4">Important Dates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Issued Date</p>
                    <p className="font-semibold">{new Date(fine.issuedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{new Date(fine.dueDate).toLocaleDateString()}</p>
                  </div>
                  {fine.paidDate && (
                    <div>
                      <p className="text-muted-foreground">Paid Date</p>
                      <p className="font-semibold">{new Date(fine.paidDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {fine.adminNotes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Admin Notes</h3>
                    <p className="text-sm text-muted-foreground">{fine.adminNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Fine Details Card */}
              <FineDetailsCard
                fine={fine}
                onStatusUpdate={handleStatusUpdate}
              />

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentHistoryTimeline
                    payments={paymentHistory}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Actions */}
              <FineActions
                fine={fine}
                onPaymentRecord={handlePaymentRecord}
                onStatusUpdate={handleStatusUpdate}
                onSendReminder={handleSendReminder}
                onAddNote={handleAddNote}
              />
            </div>
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}