import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

interface SeverityIndicatorProps {
  severity: SeverityLevel
  showIcon?: boolean
  showLabel?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const severityConfig = {
  low: {
    label: 'Low',
    icon: Info,
    badgeVariant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-500'
  },
  medium: {
    label: 'Medium',
    icon: AlertCircle,
    badgeVariant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    iconColor: 'text-yellow-500',
    dotColor: 'bg-yellow-500'
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    badgeVariant: 'destructive' as const,
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-500'
  },
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    badgeVariant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
    iconColor: 'text-red-500',
    dotColor: 'bg-red-500'
  }
}

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    dot: 'h-2 w-2',
    text: 'text-xs'
  },
  md: {
    icon: 'h-4 w-4',
    dot: 'h-3 w-3',
    text: 'text-sm'
  },
  lg: {
    icon: 'h-5 w-5',
    dot: 'h-4 w-4',
    text: 'text-base'
  }
}

export function SeverityIndicator({ 
  severity, 
  showIcon = true, 
  showLabel = true,
  className,
  size = 'md'
}: SeverityIndicatorProps) {
  const config = severityConfig[severity] || severityConfig.low
  const Icon = config.icon
  const sizes = sizeConfig[size]

  if (!showIcon && !showLabel) {
    // Just show a colored dot
    return (
      <div className={cn(
        'inline-block rounded-full',
        config.dotColor,
        sizes.dot,
        className
      )} />
    )
  }

  return (
    <Badge 
      variant={config.badgeVariant}
      className={cn(
        config.className,
        sizes.text,
        'flex items-center gap-1',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(config.iconColor, sizes.icon)} />
      )}
      {showLabel && config.label}
    </Badge>
  )
}

export function getSeverityLevel(severity: string): SeverityLevel {
  const normalized = severity.toLowerCase()
  if (['critical', 'urgent'].includes(normalized)) return 'critical'
  if (['high', 'major'].includes(normalized)) return 'high'
  if (['medium', 'moderate'].includes(normalized)) return 'medium'
  return 'low'
}

export function getSeverityWeight(severity: SeverityLevel): number {
  const weights = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  }
  return weights[severity] || 1
}
