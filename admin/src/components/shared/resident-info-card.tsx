"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Car, 
  Building, 
  History,
  AlertTriangle
} from "lucide-react"

interface ResidentInfo {
  userId: string
  flatNumber: string
  building?: string
  name: string
  email?: string
  phone?: string
  vehicleNumber?: string
  ownerName?: string
  avatar?: string
}

interface ResidentInfoCardProps {
  resident: ResidentInfo
  showVehicleInfo?: boolean
  showContactInfo?: boolean
  compact?: boolean
  onViewHistory?: () => void
  violationCount?: number
  className?: string
}

export function ResidentInfoCard({
  resident,
  showVehicleInfo = false,
  showContactInfo = false,
  compact = false,
  onViewHistory,
  violationCount,
  className
}: ResidentInfoCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatFlatNumber = () => {
    const building = resident.building ? `${resident.building}-` : ''
    return `${building}${resident.flatNumber}`
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={resident.avatar} alt={resident.name} />
          <AvatarFallback className="text-xs">
            {getInitials(resident.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{resident.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{formatFlatNumber()}</span>
          </div>
        </div>
        
        {violationCount !== undefined && violationCount > 0 && (
          <Badge 
            variant={violationCount > 3 ? "destructive" : "secondary"}
            className="gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            {violationCount}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={resident.avatar} alt={resident.name} />
            <AvatarFallback>
              {getInitials(resident.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold">{resident.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building className="h-4 w-4" />
                <span>Flat {formatFlatNumber()}</span>
              </div>
            </div>

            {/* Contact Info */}
            {showContactInfo && (resident.email || resident.phone) && (
              <div className="space-y-1">
                {resident.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{resident.email}</span>
                  </div>
                )}
                {resident.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{resident.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Info */}
            {showVehicleInfo && (resident.vehicleNumber || resident.ownerName) && (
              <div className="space-y-1">
                {resident.vehicleNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{resident.vehicleNumber}</span>
                  </div>
                )}
                {resident.ownerName && resident.ownerName !== resident.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Owner: {resident.ownerName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Violation Count */}
            {violationCount !== undefined && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={violationCount > 3 ? "destructive" : violationCount > 0 ? "secondary" : "outline"}
                  className="gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {violationCount} Violation{violationCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}

            {/* Actions */}
            {onViewHistory && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewHistory}
                  className="gap-1"
                >
                  <History className="h-3 w-3" />
                  View History
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
