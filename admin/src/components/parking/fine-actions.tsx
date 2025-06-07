"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, XCircle, MessageSquare, Send, DollarSign, AlertTriangle } from "lucide-react"
import { ViolationFine } from "@/lib/api/parking/fines"

interface FineActionsProps {
  fine: ViolationFine
  onPaymentRecord: (amount: number, method: string, notes?: string) => Promise<void>
  onStatusUpdate: (status: string, notes?: string) => Promise<void>
  onSendReminder: () => Promise<void>
  onAddNote: (note: string) => Promise<void>
}

interface PaymentDialogData {
  amount: number
  method: string
  notes: string
}

interface StatusUpdateDialogData {
  status: string
  notes: string
}

export function FineActions({ 
  fine, 
  onPaymentRecord, 
  onStatusUpdate, 
  onSendReminder, 
  onAddNote 
}: FineActionsProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const [paymentData, setPaymentData] = useState<PaymentDialogData>({
    amount: fine.totalAmount - fine.paidAmount,
    method: 'cash',
    notes: ''
  })

  const [statusData, setStatusData] = useState<StatusUpdateDialogData>({
    status: fine.status,
    notes: ''
  })

  const [noteText, setNoteText] = useState('')

  const handlePaymentRecord = async () => {
    setLoading('payment')
    try {
      await onPaymentRecord(paymentData.amount, paymentData.method, paymentData.notes)
      setPaymentDialogOpen(false)
      setPaymentData({
        amount: 0,
        method: 'cash',
        notes: ''
      })
    } catch (error) {
      console.error('Payment recording failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleStatusUpdate = async () => {
    setLoading('status')
    try {
      await onStatusUpdate(statusData.status, statusData.notes)
      setStatusDialogOpen(false)
      setStatusData({ status: fine.status, notes: '' })
    } catch (error) {
      console.error('Status update failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleSendReminder = async () => {
    setLoading('reminder')
    try {
      await onSendReminder()
    } catch (error) {
      console.error('Reminder sending failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleAddNote = async () => {
    setLoading('note')
    try {
      await onAddNote(noteText)
      setNoteDialogOpen(false)
      setNoteText('')
    } catch (error) {
      console.error('Note adding failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const remainingAmount = fine.totalAmount - fine.paidAmount

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage this fine with the available actions below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Actions */}
          {fine.status !== 'paid' && fine.status !== 'waived' && remainingAmount > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Actions
              </h4>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setPaymentDialogOpen(true)}
                  className="flex items-center gap-2"
                  disabled={loading === 'payment'}
                >
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
                <Badge variant="outline">
                  ${remainingAmount.toFixed(2)} remaining
                </Badge>
              </div>
            </div>
          )}

          <Separator />

          {/* Status Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Status Management</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStatusDialogOpen(true)}
                disabled={loading === 'status'}
              >
                Update Status
              </Button>
              {fine.status !== 'waived' && fine.status !== 'paid' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusUpdate('waived', 'Fine waived by admin')}
                  disabled={loading === 'status'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Waive Fine
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Communication Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Communication</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSendReminder}
                disabled={loading === 'reminder' || fine.status === 'paid'}
              >
                <Send className="h-4 w-4 mr-1" />
                Send Reminder
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNoteDialogOpen(true)}
                disabled={loading === 'note'}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this fine. Remaining amount: ${remainingAmount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  max={remainingAmount}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ 
                    ...prev, 
                    amount: Number(e.target.value) 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  value={paymentData.method} 
                  onValueChange={(value) => setPaymentData(prev => ({ 
                    ...prev, 
                    method: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Additional notes about the payment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentRecord} disabled={loading === 'payment'}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Fine Status</DialogTitle>
            <DialogDescription>
              Change the status of this fine and add any relevant notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select 
                value={statusData.status} 
                onValueChange={(value) => setStatusData(prev => ({ 
                  ...prev, 
                  status: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-notes">Reason/Notes</Label>
              <Textarea
                id="status-notes"
                value={statusData.notes}
                onChange={(e) => setStatusData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Reason for status change..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={loading === 'status'}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to this fine for internal reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note here..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={loading === 'note'}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
