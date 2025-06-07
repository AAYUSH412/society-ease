'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, BellRing } from 'lucide-react'
import { getActiveAlertsForResident } from '@/lib/api/resident-alerts'

interface AlertNotificationBadgeProps {
  onClick?: () => void
  className?: string
  showCount?: boolean
  animated?: boolean
}

export const AlertNotificationBadge: React.FC<AlertNotificationBadgeProps> = ({
  onClick,
  className = '',
  showCount = true,
  animated = true
}) => {
  const [alertCount, setAlertCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasNewAlerts, setHasNewAlerts] = useState(false)

  useEffect(() => {
    fetchAlertCount()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAlertCount, 30000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchAlertCount = async () => {
    try {
      const response = await getActiveAlertsForResident()
      
      if (response.success && response.data) {
        const newCount = response.data.length
        
        // Check if there are new alerts
        if (newCount > alertCount && alertCount > 0) {
          setHasNewAlerts(true)
          // Reset the new alerts flag after 5 seconds
          setTimeout(() => setHasNewAlerts(false), 5000)
        }
        
        setAlertCount(newCount)
      }
    } catch (error) {
      console.error('Failed to fetch alert count:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    setHasNewAlerts(false)
    onClick?.()
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className={className} disabled>
        <Bell className="h-4 w-4" />
      </Button>
    )
  }

  const IconComponent = hasNewAlerts ? BellRing : Bell

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`relative ${className}`}
      onClick={handleClick}
    >
      <IconComponent 
        className={`h-4 w-4 ${hasNewAlerts && animated ? 'animate-bounce' : ''} ${
          alertCount > 0 ? 'text-red-500' : ''
        }`} 
      />
      
      {alertCount > 0 && showCount && (
        <Badge
          variant="destructive"
          className={`absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4 flex items-center justify-center ${
            hasNewAlerts && animated ? 'animate-pulse' : ''
          }`}
        >
          {alertCount > 99 ? '99+' : alertCount}
        </Badge>
      )}
      
      {alertCount > 0 && !showCount && (
        <div 
          className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ${
            hasNewAlerts && animated ? 'animate-ping' : ''
          }`} 
        />
      )}
    </Button>
  )
}

// Simple version for use in layouts
export const SimpleAlertBadge: React.FC<{
  onClick?: () => void
  className?: string
}> = ({ onClick, className }) => {
  return (
    <AlertNotificationBadge
      onClick={onClick}
      className={className}
      showCount={false}
      animated={false}
    />
  )
}
