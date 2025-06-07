import { 
  Car, 
  Truck, 
  MapPin, 
  AlertTriangle,
  Bike,
  Accessibility,
  Clock,
  Shield,
  Ban,
  ParkingCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViolationType = 
  | 'unauthorized_parking' 
  | 'visitor_parking_misuse' 
  | 'reserved_spot_violation'
  | 'fire_lane_blocking'
  | 'handicap_space_misuse'
  | 'time_limit_exceeded'
  | 'no_permit_displayed'
  | 'expired_permit'
  | 'double_parking'
  | 'motorcycle_violation'
  | 'other'

interface ViolationTypeIconProps {
  type: ViolationType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

const typeConfig = {
  unauthorized_parking: {
    icon: Car,
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  visitor_parking_misuse: {
    icon: MapPin,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  },
  reserved_spot_violation: {
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  fire_lane_blocking: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  handicap_space_misuse: {
    icon: Accessibility,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  time_limit_exceeded: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50'
  },
  no_permit_displayed: {
    icon: Ban,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  },
  expired_permit: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  double_parking: {
    icon: Truck,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50'
  },
  motorcycle_violation: {
    icon: Bike,
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  other: {
    icon: ParkingCircle,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50'
  }
}

export function ViolationTypeIcon({ 
  type, 
  className, 
  size = 'md' 
}: ViolationTypeIconProps) {
  const config = typeConfig[type] || typeConfig.other
  const Icon = config.icon

  return (
    <div className={cn(
      'inline-flex items-center justify-center rounded-full p-2',
      config.bgColor,
      className
    )}>
      <Icon className={cn(
        config.color,
        sizeConfig[size]
      )} />
    </div>
  )
}

export function getViolationTypeLabel(type: ViolationType): string {
  const labels = {
    unauthorized_parking: 'Unauthorized Parking',
    visitor_parking_misuse: 'Visitor Parking Misuse',  
    reserved_spot_violation: 'Reserved Spot Violation',
    fire_lane_blocking: 'Fire Lane Blocking',
    handicap_space_misuse: 'Handicap Space Misuse',
    time_limit_exceeded: 'Time Limit Exceeded',
    no_permit_displayed: 'No Permit Displayed',
    expired_permit: 'Expired Permit',
    double_parking: 'Double Parking',
    motorcycle_violation: 'Motorcycle Violation',
    other: 'Other'
  }
  
  return labels[type] || 'Unknown'
}
