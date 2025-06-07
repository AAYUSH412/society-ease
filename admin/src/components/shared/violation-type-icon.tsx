"use client"

import { cn } from "@/lib/utils"
import { 
  Car, 
  Ban, 
  Clock, 
  Zap, 
  Shield, 
  MapPin,
  Users,
  Volume2,
  Trash
} from "lucide-react"

interface ViolationTypeIconProps {
  type?: string
  violationType?: string
  size?: 'sm' | 'md' | 'lg'
  showBackground?: boolean
  className?: string
}

function getIconConfig(violationType: string) {
  switch (violationType.toLowerCase()) {
    case 'unauthorized_parking':
    case 'no_permit':
      return {
        icon: Ban,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900'
      }
    case 'reserved_spot_violation':
    case 'handicap_violation':
      return {
        icon: Shield,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900'
      }
    case 'visitor_parking_misuse':
    case 'guest_parking':
      return {
        icon: Users,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100 dark:bg-orange-900'
      }
    case 'blocking_driveway':
    case 'blocking_entrance':
      return {
        icon: Shield,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900'
      }
    case 'overtime_parking':
    case 'time_limit_exceeded':
      return {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900'
      }
    case 'fire_lane_parking':
    case 'emergency_access':
      return {
        icon: Zap,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900'
      }
    case 'wrong_spot':
    case 'assigned_parking':
      return {
        icon: MapPin,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900'
      }
    case 'noise_violation':
    case 'loud_vehicle':
      return {
        icon: Volume2,
        color: 'text-pink-500',
        bgColor: 'bg-pink-100 dark:bg-pink-900'
      }
    case 'littering':
    case 'garbage_dumping':
      return {
        icon: Trash,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900'
      }
    default:
      return {
        icon: Car,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-900'
      }
  }
}

export function ViolationTypeIcon({ 
  type,
  violationType, 
  size = 'md', 
  showBackground = false,
  className 
}: ViolationTypeIconProps) {
  const violationTypeToUse = type || violationType || 'other'
  
  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 'h-3 w-3',
          containerSize: 'h-6 w-6',
          padding: 'p-1'
        }
      case 'lg':
        return {
          iconSize: 'h-6 w-6',
          containerSize: 'h-12 w-12',
          padding: 'p-3'
        }
      default: // md
        return {
          iconSize: 'h-4 w-4',
          containerSize: 'h-8 w-8',
          padding: 'p-2'
        }
    }
  }

  const iconConfig = getIconConfig(violationTypeToUse)
  const sizeConfig = getSizeConfig(size)
  const IconComponent = iconConfig.icon

  if (showBackground) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center",
        sizeConfig.containerSize,
        sizeConfig.padding,
        iconConfig.bgColor,
        className
      )}>
        <IconComponent className={cn(sizeConfig.iconSize, iconConfig.color)} />
      </div>
    )
  }

  return (
    <IconComponent className={cn(sizeConfig.iconSize, iconConfig.color, className)} />
  )
}

// Utility function to get violation type display name
export function getViolationTypeDisplayName(violationType: string): string {
  const displayNames: Record<string, string> = {
    'unauthorized_parking': 'Unauthorized Parking',
    'no_parking_zone': 'No Parking Zone',
    'visitor_parking_misuse': 'Visitor Parking Misuse',
    'guest_parking': 'Guest Parking Violation',
    'blocking_driveway': 'Blocking Driveway',
    'blocking_entrance': 'Blocking Entrance',
    'overtime_parking': 'Overtime Parking',
    'time_limit_exceeded': 'Time Limit Exceeded',
    'handicap_violation': 'Handicap Violation',
    'disabled_parking': 'Disabled Parking Violation',
    'fire_lane_parking': 'Fire Lane Parking',
    'emergency_access': 'Emergency Access Blocked',
    'wrong_spot': 'Wrong Parking Spot',
    'assigned_parking': 'Assigned Parking Violation',
    'noise_violation': 'Noise Violation',
    'loud_vehicle': 'Loud Vehicle',
    'littering': 'Littering',
    'garbage_dumping': 'Garbage Dumping'
  }

  const normalizedType = violationType.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return displayNames[normalizedType] || violationType
}
