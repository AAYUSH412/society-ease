'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  Archive, 
  CheckCircle, 
  RefreshCw,
  FileDown,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AlertBulkActionsProps {
  selectedCount: number
  onBulkDelete: () => void
  onBulkResolve: () => void
  onBulkArchive: () => void
  onBulkExport: () => void
  onRefresh: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  disabled?: boolean
}

export const AlertBulkActions: React.FC<AlertBulkActionsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkResolve,
  onBulkArchive,
  onBulkExport,
  onRefresh,
  onSelectAll,
  onDeselectAll,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={disabled}
            >
              Clear Selection
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={disabled}
          >
            Select All
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={disabled}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkExport}
          disabled={disabled}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>

        {selectedCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onBulkResolve}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBulkDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
