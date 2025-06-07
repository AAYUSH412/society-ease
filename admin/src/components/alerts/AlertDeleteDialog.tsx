'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface AlertDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  alertTitle?: string
  loading?: boolean
  isMultiple?: boolean
  count?: number
}

export const AlertDeleteDialog: React.FC<AlertDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  alertTitle,
  loading = false,
  isMultiple = false,
  count = 1
}) => {
  const title = isMultiple ? `Delete ${count} Alerts` : 'Delete Alert'
  const description = isMultiple 
    ? `Are you sure you want to delete ${count} selected alerts? This action cannot be undone.`
    : `Are you sure you want to delete "${alertTitle}"? This action cannot be undone.`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {isMultiple ? 'Alerts' : 'Alert'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
