'use client'

import React from 'react'
import { 
  Droplets, 
  Zap, 
  Flame, 
  Home, 
  Settings, 
  Shield, 
  Wifi, 
  AlertCircle,
  type LucideIcon
} from 'lucide-react'
import { ResidentAlert } from '@/lib/api/resident-alerts'

interface ResidentAlertTypeIconProps {
  type: ResidentAlert['type']
  className?: string
}

export const ResidentAlertTypeIcon: React.FC<ResidentAlertTypeIconProps> = ({
  type,
  className = 'h-4 w-4'
}) => {
  const getTypeIcon = (type: ResidentAlert['type']): LucideIcon => {
    switch (type) {
      case 'water':
        return Droplets
      case 'electricity':
        return Zap
      case 'gas':
        return Flame
      case 'general':
        return Home
      case 'maintenance':
        return Settings
      case 'security':
        return Shield
      case 'internet':
        return Wifi
      default:
        return AlertCircle
    }
  }

  const getTypeColor = (type: ResidentAlert['type']): string => {
    switch (type) {
      case 'water':
        return 'text-blue-600'
      case 'electricity':
        return 'text-yellow-600'
      case 'gas':
        return 'text-orange-600'
      case 'general':
        return 'text-gray-600'
      case 'maintenance':
        return 'text-purple-600'
      case 'security':
        return 'text-red-600'
      case 'internet':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const IconComponent = getTypeIcon(type)
  const colorClass = getTypeColor(type)

  return (
    <IconComponent className={`${className} ${colorClass}`} />
  )
}
