"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Calculator, Calendar, FileText, IndianRupee, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateBulkBills } from "@/lib/api/admin-billing"

interface SingleBillCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  resident?: {
    id: string
    name: string
    flatNumber: string
    building?: string
    email: string
    phone: string
  }
}

interface BillFormData {
  residentId: string
  billType: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  month: number
  year: number
  baseAmount: number
  utilityCharges: number
  parkingFee: number
  specialAssessments: number
  lateFeePenalty: number
  otherCharges: number
  taxRate: number
  discount: number
  dueDate: string
  description: string
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
]

const BILL_TYPES = [
  { value: 'maintenance', label: 'Monthly Maintenance' },
  { value: 'special_assessment', label: 'Special Assessment' },
  { value: 'penalty', label: 'Penalty/Late Fee' },
  { value: 'other', label: 'Other Charges' }
]

export function SingleBillCreationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  resident 
}: SingleBillCreationModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BillFormData>({
    residentId: resident?.id || '',
    billType: 'maintenance',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseAmount: 5500,
    utilityCharges: 1200,
    parkingFee: 1000,
    specialAssessments: 0,
    lateFeePenalty: 0,
    otherCharges: 0,
    taxRate: 18,
    discount: 0,
    dueDate: '',
    description: ''
  })

  // Calculate totals
  const subtotal = formData.baseAmount + formData.utilityCharges + formData.parkingFee + 
                   formData.specialAssessments + formData.lateFeePenalty + formData.otherCharges
  const taxAmount = (subtotal * formData.taxRate) / 100
  const totalAmount = subtotal + taxAmount - formData.discount

  const handleInputChange = (field: keyof BillFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validate required fields
      if (!formData.residentId || !formData.dueDate || formData.baseAmount <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // Generate bill using bulk endpoint with single resident
      const result = await generateBulkBills({
        month: formData.month,
        year: formData.year,
        billType: formData.billType,
        baseAmount: formData.baseAmount,
        dueDate: formData.dueDate,
        description: formData.description,
        additionalCharges: {
          utilityCharges: formData.utilityCharges,
          parkingFee: formData.parkingFee,
          specialAssessments: formData.specialAssessments,
          lateFeePenalty: formData.lateFeePenalty,
          otherCharges: formData.otherCharges
        },
        selectedResidents: [formData.residentId]
      })

      if (result.success) {
        toast({
          title: "Bill Created Successfully",
          description: `Bill generated for ${resident?.name || 'resident'}`,
        })
        onSuccess()
        onClose()
      }

    } catch (error) {
      console.error('Bill creation error:', error)
      toast({
        title: "Error Creating Bill",
        description: error instanceof Error ? error.message : "Failed to create bill",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Set default due date when component mounts
  useState(() => {
    if (!formData.dueDate) {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(5) // 5th of next month
      setFormData(prev => ({
        ...prev,
        dueDate: nextMonth.toISOString().split('T')[0]
      }))
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Single Bill
          </DialogTitle>
          <DialogDescription>
            Generate a bill for a specific resident with custom charges
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resident Information */}
            {resident && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Resident Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="font-medium">{resident.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Flat:</span>
                    <Badge variant="outline">{resident.flatNumber}</Badge>
                  </div>
                  {resident.building && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Building:</span>
                      <span className="font-medium">{resident.building}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bill Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billType">Bill Type</Label>
                    <Select 
                      value={formData.billType} 
                      onValueChange={(value: 'maintenance' | 'special_assessment' | 'penalty' | 'other') => 
                        handleInputChange('billType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BILL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Billing Month</Label>
                    <Select 
                      value={formData.month.toString()} 
                      onValueChange={(value) => handleInputChange('month', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Billing Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any additional notes about this bill..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Charges Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Charges Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseAmount">Base Amount *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="baseAmount"
                        type="number"
                        value={formData.baseAmount}
                        onChange={(e) => handleInputChange('baseAmount', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilityCharges">Utility Charges</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="utilityCharges"
                        type="number"
                        value={formData.utilityCharges}
                        onChange={(e) => handleInputChange('utilityCharges', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parkingFee">Parking Fee</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parkingFee"
                        type="number"
                        value={formData.parkingFee}
                        onChange={(e) => handleInputChange('parkingFee', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialAssessments">Special Assessments</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="specialAssessments"
                        type="number"
                        value={formData.specialAssessments}
                        onChange={(e) => handleInputChange('specialAssessments', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lateFeePenalty">Late Fee/Penalty</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lateFeePenalty"
                        type="number"
                        value={formData.lateFeePenalty}
                        onChange={(e) => handleInputChange('lateFeePenalty', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherCharges">Other Charges</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otherCharges"
                        type="number"
                        value={formData.otherCharges}
                        onChange={(e) => handleInputChange('otherCharges', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                      min={0}
                      max={50}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bill Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Bill Summary
                </CardTitle>
                <CardDescription>
                  Total amount calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Amount:</span>
                    <span>₹{formData.baseAmount.toLocaleString()}</span>
                  </div>
                  
                  {formData.utilityCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Utility Charges:</span>
                      <span>₹{formData.utilityCharges.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {formData.parkingFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Parking Fee:</span>
                      <span>₹{formData.parkingFee.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {formData.specialAssessments > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Special Assessments:</span>
                      <span>₹{formData.specialAssessments.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {formData.lateFeePenalty > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Late Fee/Penalty:</span>
                      <span>₹{formData.lateFeePenalty.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {formData.otherCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Other Charges:</span>
                      <span>₹{formData.otherCharges.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {formData.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({formData.taxRate}%):</span>
                      <span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-₹{formData.discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₹{Math.max(0, totalAmount).toLocaleString()}</span>
                </div>

                {totalAmount < 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      Total amount cannot be negative
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bill Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Type:</span>
                  <span className="capitalize">{formData.billType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span>{MONTHS.find(m => m.value === formData.month)?.label} {formData.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || totalAmount <= 0}
            className="min-w-[120px]"
          >
            {loading ? "Creating..." : "Create Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
