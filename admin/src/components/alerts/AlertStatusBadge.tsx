'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  Info 
} from 'lucide-react'

interface AlertStatusBadgeProps {
  status: string
  showIcon?: boolean
  className?: string
}

export const AlertStatusBadge: React.FC<AlertStatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  className = '' 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-3 w-3 text-orange-500" />
      case 'resolved':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-500" />
      case 'closed':
        return <XCircle className="h-3 w-3 text-gray-500" />
      case 'scheduled':
        return <Calendar className="h-3 w-3 text-purple-500" />
      case 'cancelled':
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <Info className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Badge className={`${getStatusColor(status)} ${className}`}>
      {showIcon && getStatusIcon(status)}
      <span className={showIcon ? 'ml-1' : ''}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    </Badge>
  )
}
