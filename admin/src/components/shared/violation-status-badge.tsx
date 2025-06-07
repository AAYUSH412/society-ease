"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ViolationStatusBadgeProps {
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'dismissed'
  className?: string
}

export function ViolationStatusBadge({ status, className }: ViolationStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }
      case 'under_review':
        return {
          label: 'Under Review',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        }
      case 'approved':
        return {
          label: 'Approved',
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }
      case 'resolved':
        return {
          label: 'Resolved',
          variant: 'secondary' as const,
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
        }
      case 'dismissed':
        return {
          label: 'Dismissed',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
