'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ResidentAlert } from '@/lib/api/resident-alerts'

interface ResidentAlertPriorityBadgeProps {
  priority: ResidentAlert['priority']
  size?: 'sm' | 'default'
}

export const ResidentAlertPriorityBadge: React.FC<ResidentAlertPriorityBadgeProps> = ({
  priority,
  size = 'default'
}) => {
  const getPriorityConfig = (priority: ResidentAlert['priority']) => {
    switch (priority) {
      case 'critical':
        return {
          label: 'Critical',
          variant: 'destructive' as const,
          className: 'bg-red-600 text-white border-red-600 hover:bg-red-700'
        }
      case 'high':
        return {
          label: 'High',
          variant: 'destructive' as const,
          className: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
        }
      case 'medium':
        return {
          label: 'Medium',
          variant: 'default' as const,
          className: 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
        }
      case 'low':
        return {
          label: 'Low',
          variant: 'secondary' as const,
          className: 'bg-green-500 text-white border-green-500 hover:bg-green-600'
        }
      default:
        return {
          label: priority,
          variant: 'outline' as const,
          className: ''
        }
    }
  }

  const config = getPriorityConfig(priority)

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : ''}`}
    >
      {config.label}
    </Badge>
  )
}
