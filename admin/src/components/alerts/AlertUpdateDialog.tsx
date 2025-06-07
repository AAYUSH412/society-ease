'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'

interface AlertUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { message: string; updateType: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general' }) => void
  loading?: boolean
}

export const AlertUpdateDialog: React.FC<AlertUpdateDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false
}) => {
  const [updateMessage, setUpdateMessage] = useState('')
  const [updateType, setUpdateType] = useState<'progress' | 'delay' | 'resolution' | 'escalation' | 'general'>('general')

  const handleSubmit = () => {
    if (updateMessage.trim()) {
      onSubmit({ message: updateMessage, updateType })
      setUpdateMessage('')
      setUpdateType('general')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Update</DialogTitle>
          <DialogDescription>
            Add a new update to this alert to keep stakeholders informed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="update-type">Update Type</Label>
            <Select value={updateType} onValueChange={(value: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general') => setUpdateType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Update</SelectItem>
                <SelectItem value="progress">Progress Update</SelectItem>
                <SelectItem value="delay">Delay Notification</SelectItem>
                <SelectItem value="escalation">Escalation</SelectItem>
                <SelectItem value="resolution">Resolution Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="update-message">Update Message</Label>
            <Textarea
              id="update-message"
              placeholder="Enter your update message..."
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!updateMessage.trim() || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Add Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
