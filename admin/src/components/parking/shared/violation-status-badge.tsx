import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type ViolationStatus = 'pending' | 'resolved' | 'under_review' | 'dismissed' | 'escalated'

interface ViolationStatusBadgeProps {
  status: ViolationStatus
  className?: string
}

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  resolved: {
    label: 'Resolved',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  under_review: {
    label: 'Under Review',
    variant: 'outline' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  dismissed: {
    label: 'Dismissed',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  },
  escalated: {
    label: 'Escalated',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  }
}

export function ViolationStatusBadge({ status, className }: ViolationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
