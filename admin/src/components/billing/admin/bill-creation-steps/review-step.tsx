"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Building,
  Calculator,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface BillingPeriod {
  month: number
  year: number
  type: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  description?: string
}

interface SelectedResident {
  id: string
  flatNumber: string
  building?: string
  ownerName: string
  email: string
  phone: string
  isSelected: boolean
}

interface ChargeConfig {
  maintenanceAmount: number
  utilityCharges: number
  parkingFee: number
  specialAssessments: number
  lateFeePenalty: number
  otherCharges: number
  description: string
}

interface ReviewStepProps {
  billingPeriod: BillingPeriod
  selectedResidents: SelectedResident[]
  charges: ChargeConfig
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const BILL_TYPE_LABELS = {
  maintenance: "Monthly Maintenance",
  special_assessment: "Special Assessment",
  penalty: "Penalty/Late Fee",
  other: "Other Charges"
}

export function ReviewStep({ billingPeriod, selectedResidents, charges }: ReviewStepProps) {
  const totalAmount = charges.maintenanceAmount + 
                     charges.utilityCharges + 
                     charges.parkingFee + 
                     charges.specialAssessments + 
                     charges.lateFeePenalty + 
                     charges.otherCharges

  const totalBillValue = totalAmount * selectedResidents.length

  const chargeBreakdown = [
    { label: "Maintenance Charges", amount: charges.maintenanceAmount, show: charges.maintenanceAmount > 0 },
    { label: "Utility Charges", amount: charges.utilityCharges, show: charges.utilityCharges > 0 },
    { label: "Parking Fee", amount: charges.parkingFee, show: charges.parkingFee > 0 },
    { label: "Special Assessments", amount: charges.specialAssessments, show: charges.specialAssessments > 0 },
    { label: "Late Fee/Penalty", amount: charges.lateFeePenalty, show: charges.lateFeePenalty > 0 },
    { label: "Other Charges", amount: charges.otherCharges, show: charges.otherCharges > 0 }
  ].filter(item => item.show)

  // Group residents by building
  const residentsByBuilding = selectedResidents.reduce((acc, resident) => {
    const building = resident.building || 'No Building'
    if (!acc[building]) {
      acc[building] = []
    }
    acc[building].push(resident)
    return acc
  }, {} as Record<string, SelectedResident[]>)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review & Preview
          </CardTitle>
          <CardDescription>
            Review all bill details before generating. This is your final chance to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Billing Period Info */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {MONTHS[billingPeriod.month - 1]} {billingPeriod.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bill Type</p>
                  <Badge variant="outline">
                    {BILL_TYPE_LABELS[billingPeriod.type]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(billingPeriod.year, billingPeriod.month, 15).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {billingPeriod.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{billingPeriod.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients Summary */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recipients ({selectedResidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(residentsByBuilding).map(([building, residents]) => (
                  <div key={building}>
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{building}</span>
                      <Badge variant="secondary">{residents.length} units</Badge>
                    </div>
                    <div className="ml-6 space-y-1">
                      {residents.slice(0, 3).map(resident => (
                        <p key={resident.id} className="text-sm text-muted-foreground">
                          {resident.flatNumber} - {resident.ownerName}
                        </p>
                      ))}
                      {residents.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {residents.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charges Summary */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Charge Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {chargeBreakdown.map((charge, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{charge.label}</span>
                    <span className="font-medium">₹{charge.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total per Bill</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              {charges.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{charges.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Generation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {selectedResidents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Bills to Generate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Amount per Bill</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₹{totalBillValue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Collection</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Bill Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Bill Preview
              </CardTitle>
              <CardDescription>
                Preview of how the bill will appear for residents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white space-y-4">
                {/* Sample Bill Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-lg font-bold">Society Ease</h3>
                  <p className="text-sm text-muted-foreground">Billing Statement</p>
                </div>

                {/* Sample Bill Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bill To:</p>
                    <p className="font-medium">
                      {selectedResidents[0]?.ownerName || 'Sample Resident'}
                    </p>
                    <p>{selectedResidents[0]?.flatNumber || 'A-101'}</p>
                    <p>{selectedResidents[0]?.building || 'Building A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Bill #: BILL-2024-001</p>
                    <p className="text-muted-foreground">
                      Date: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground">
                      Due: {new Date(billingPeriod.year, billingPeriod.month, 15).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Sample Charges */}
                <div className="space-y-2">
                  <p className="font-medium">Charges:</p>
                  {chargeBreakdown.map((charge, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{charge.label}</span>
                      <span>₹{charge.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Checklist */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-green-900">Ready to Generate</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Billing period selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>{selectedResidents.length} residents selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Charges configured (₹{totalAmount.toLocaleString('en-IN')} per bill)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning if needed */}
          {totalAmount === 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Warning</h4>
                    <p className="text-sm text-yellow-800">
                      Total bill amount is ₹0. Please go back and configure charges before generating bills.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
