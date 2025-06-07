'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ResidentAlert } from '@/lib/api/resident-alerts'

interface ResidentAlertStatusBadgeProps {
  status: ResidentAlert['status']
  size?: 'sm' | 'default'
}

export const ResidentAlertStatusBadge: React.FC<ResidentAlertStatusBadgeProps> = ({
  status,
  size = 'default'
}) => {
  const getStatusConfig = (status: ResidentAlert['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }
      case 'resolved':
        return {
          label: 'Resolved',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        }
      case 'scheduled':
        return {
          label: 'Scheduled',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        }
      default:
        return {
          label: status,
          variant: 'outline' as const,
          className: ''
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : ''}`}
    >
      {config.label}
    </Badge>
  )
}
