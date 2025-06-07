"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, MapPin, User, AlertCircle, Clock, FileText, CreditCard } from "lucide-react"
import { ViolationFine } from "@/lib/api/parking/fines"

interface FineDetailsCardProps {
  fine: ViolationFine
  onStatusUpdate?: (status: string) => void
  onPaymentRecord?: () => void
}

export function FineDetailsCard({ fine, onStatusUpdate, onPaymentRecord }: FineDetailsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'waived': return 'bg-gray-100 text-gray-800'
      case 'disputed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      case 'partially_paid': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fine Details
            </CardTitle>
            <CardDescription>Fine ID: {fine.fineId}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(fine.status)}>
              {fine.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPaymentStatusColor(fine.paymentStatus)}>
              {fine.paymentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Violation Information */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Violation Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{fine.violation.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="font-medium">{fine.violation.description}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Incident Date
              </p>
              <p className="font-medium">
                {new Date(fine.violation.incidentDateTime).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </p>
              <p className="font-medium">{fine.violation.location}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Resident Information */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Resident Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{fine.resident.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Flat Number</p>
              <p className="font-medium">
                {fine.resident.building ? `${fine.resident.building}-` : ''}{fine.resident.flatNumber}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{fine.resident.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{fine.resident.phone}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Financial Information */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Fine Amount</p>
              <p className="font-medium">${fine.fineAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Late Fee</p>
              <p className="font-medium">${fine.lateFee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount Paid</p>
              <p className="font-medium">${fine.paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Total Amount</p>
              <p className="font-bold text-lg">${fine.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Important Dates */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Important Dates
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Issued Date</p>
              <p className="font-medium">
                {new Date(fine.issuedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {new Date(fine.dueDate).toLocaleDateString()}
              </p>
            </div>
            {fine.paidDate && (
              <div>
                <p className="text-muted-foreground">Paid Date</p>
                <p className="font-medium">
                  {new Date(fine.paidDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {fine.lastReminderSent && (
              <div>
                <p className="text-muted-foreground">Last Reminder</p>
                <p className="font-medium">
                  {new Date(fine.lastReminderSent).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onStatusUpdate || onPaymentRecord) && (
          <>
            <Separator />
            <div className="flex gap-2">
              {onPaymentRecord && fine.status !== 'paid' && (
                <Button onClick={onPaymentRecord} className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
              )}
              {onStatusUpdate && (
                <Button 
                  variant="outline" 
                  onClick={() => onStatusUpdate('waived')}
                  disabled={fine.status === 'paid' || fine.status === 'waived'}
                >
                  Waive Fine
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
