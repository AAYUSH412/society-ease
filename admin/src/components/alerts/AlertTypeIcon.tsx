'use client'

import React from 'react'
import { 
  Droplets, 
  Zap, 
  Flame, 
  Wifi, 
  Shield, 
  Settings, 
  Info,
  AlertTriangle 
} from 'lucide-react'

interface AlertTypeIconProps {
  type: string
  className?: string
}

export const AlertTypeIcon: React.FC<AlertTypeIconProps> = ({ 
  type, 
  className = 'h-4 w-4' 
}) => {
  const getTypeIcon = (type: string) => {
    const iconProps = { className }
    
    switch (type) {
      case 'water':
        return <Droplets {...iconProps} style={{ color: '#3b82f6' }} />
      case 'electricity':
        return <Zap {...iconProps} style={{ color: '#eab308' }} />
      case 'gas':
        return <Flame {...iconProps} style={{ color: '#f97316' }} />
      case 'internet':
        return <Wifi {...iconProps} style={{ color: '#10b981' }} />
      case 'security':
        return <Shield {...iconProps} style={{ color: '#ef4444' }} />
      case 'maintenance':
        return <Settings {...iconProps} style={{ color: '#8b5cf6' }} />
      case 'general':
        return <Info {...iconProps} style={{ color: '#6b7280' }} />
      default:
        return <AlertTriangle {...iconProps} style={{ color: '#6b7280' }} />
    }
  }

  return getTypeIcon(type)
}
