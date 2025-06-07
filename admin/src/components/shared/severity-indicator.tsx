"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info, AlertCircle, Zap } from "lucide-react"

interface SeverityIndicatorProps {
  severity: 'low' | 'medium' | 'high' | 'critical'
  showIcon?: boolean
  className?: string
}

export function SeverityIndicator({ severity, showIcon = true, className }: SeverityIndicatorProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'low':
        return {
          label: 'Low',
          icon: Info,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        }
      case 'medium':
        return {
          label: 'Medium',
          icon: AlertCircle,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
        }
      case 'high':
        return {
          label: 'High',
          icon: AlertTriangle,
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        }
      case 'critical':
        return {
          label: 'Critical',
          icon: Zap,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800'
        }
      default:
        return {
          label: severity,
          icon: Info,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800'
        }
    }
  }

  const config = getSeverityConfig(severity)
  const IconComponent = config.icon

  return (
    <Badge 
      variant="outline"
      className={cn(config.className, "gap-1", className)}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
