"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, FileText, User, Building } from "lucide-react"
import { recordManualPayment, ManualPaymentData } from "@/lib/api/admin-billing"

// Form validation schema
const manualPaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  paymentMethod: z.enum(['cash', 'cheque', 'bank_transfer'], {
    required_error: "Please select a payment method",
  }),
  description: z.string().optional(),
  adminNotes: z.string().optional(),
  // Conditional fields for bank transfer
  bankTransferTransactionId: z.string().optional(),
  bankTransferBankName: z.string().optional(),
  bankTransferAccountNumber: z.string().optional(),
  // Conditional fields for cheque
  chequeNumber: z.string().optional(),
  chequeBankName: z.string().optional(),
  chequeDate: z.string().optional(),
}).refine((data) => {
  // Validate bank transfer fields when bank_transfer is selected
  if (data.paymentMethod === 'bank_transfer') {
    return data.bankTransferTransactionId && data.bankTransferBankName && data.bankTransferAccountNumber
  }
  return true
}, {
  message: "All bank transfer details are required when payment method is bank transfer",
  path: ["bankTransferTransactionId"]
}).refine((data) => {
  // Validate cheque fields when cheque is selected
  if (data.paymentMethod === 'cheque') {
    return data.chequeNumber && data.chequeBankName && data.chequeDate
  }
  return true
}, {
  message: "All cheque details are required when payment method is cheque",
  path: ["chequeNumber"]
})

type ManualPaymentFormData = z.infer<typeof manualPaymentSchema>

interface ManualPaymentDialogProps {
  payment: {
    id: string
    billId: string
    billNumber: string
    flatNumber: string
    building: string
    residentName: string
    amount: number
    status: string
    dueDate: string
  }
  onSuccess?: () => void
  children: React.ReactNode
}

export function ManualPaymentDialog({ 
  payment, 
  onSuccess, 
  children 
}: ManualPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ManualPaymentFormData>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: {
      amount: payment.amount,
      paymentMethod: undefined,
      description: '',
      adminNotes: '',
      bankTransferTransactionId: '',
      bankTransferBankName: '',
      bankTransferAccountNumber: '',
      chequeNumber: '',
      chequeBankName: '',
      chequeDate: '',
    },
  })

  const watchPaymentMethod = form.watch("paymentMethod")

  const onSubmit = async (data: ManualPaymentFormData) => {
    try {
      setIsSubmitting(true)

      // Transform form data to API format
      const paymentData: ManualPaymentData = {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        adminNotes: data.adminNotes,
      }

      // Add conditional fields based on payment method
      if (data.paymentMethod === 'bank_transfer') {
        paymentData.bankTransferDetails = {
          transactionId: data.bankTransferTransactionId!,
          bankName: data.bankTransferBankName!,
          accountNumber: data.bankTransferAccountNumber!,
        }
      } else if (data.paymentMethod === 'cheque') {
        paymentData.chequeDetails = {
          chequeNumber: data.chequeNumber!,
          bankName: data.chequeBankName!,
          chequeDate: data.chequeDate!,
        }
      }

      const response = await recordManualPayment(payment.billId, paymentData)

      if (response.success) {
        alert('Payment recorded successfully!')
        
        form.reset()
        setOpen(false)
        onSuccess?.()
      } else {
        throw new Error(response.message || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording manual payment:', error)
      alert(error instanceof Error ? error.message : "Failed to record payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Manual Payment
          </DialogTitle>
          <DialogDescription>
            Record a manual payment for bill {payment.billNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Bill Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bill Number</p>
                  <p className="text-sm text-muted-foreground">{payment.billNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Property</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.building} - {payment.flatNumber}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Resident</p>
                  <p className="text-sm text-muted-foreground">{payment.residentName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bill Amount</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={payment.status === 'overdue' ? 'destructive' : 'secondary'}>
                {payment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum: ₹{payment.amount.toLocaleString('en-IN')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Payment Method Fields */}
            {watchPaymentMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Bank Transfer Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankTransferTransactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter transaction ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bankTransferBankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="bankTransferAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchPaymentMethod === 'cheque' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Cheque Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chequeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cheque Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter cheque number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="chequeBankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="chequeDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cheque Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter payment description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter internal notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes are for internal use only and won&apos;t be visible to residents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
