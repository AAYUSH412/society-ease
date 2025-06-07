'use client'

import React from 'react'
import { Alert } from '@/lib/api/alerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Eye, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  XCircle,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Shield,
  Settings,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AlertCardProps {
  alert: Alert
  showActions?: boolean
  onEdit?: (alert: Alert) => void
  onView?: (alert: Alert) => void
}

const AlertTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'electricity': return <Zap className={className} />
    case 'water': return <Droplets className={className} />
    case 'gas': return <Flame className={className} />
    case 'internet': return <Wifi className={className} />
    case 'security': return <Shield className={className} />
    case 'maintenance': return <Settings className={className} />
    default: return <Info className={className} />
  }
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  showActions = true,
  onEdit,
  onView
}) => {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive'
      case 'resolved': return 'default'
      case 'scheduled': return 'secondary'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleView = () => {
    if (onView) {
      onView(alert)
    } else {
      router.push(`/admin/alerts/${alert._id}`)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(alert)
    } else {
      router.push(`/admin/alerts/${alert._id}/edit`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVisibilityText = (visibility: Alert['visibility']) => {
    switch (visibility.scope) {
      case 'all':
        return 'All residents'
      case 'specific_buildings':
        return visibility.affectedAreas.buildings?.length 
          ? `${visibility.affectedAreas.buildings.length} building(s)`
          : 'Specific buildings'
      case 'specific_flats':
        return visibility.affectedAreas.flats?.length
          ? `${visibility.affectedAreas.flats.length} flat(s)`
          : 'Specific flats'
      case 'specific_areas':
        return visibility.affectedAreas.areas?.length
          ? `${visibility.affectedAreas.areas.length} area(s)`
          : 'Specific areas'
      default:
        return 'Unknown scope'
    }
  }

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTypeIcon type={alert.type} />
            <div>
              <CardTitle className="text-lg line-clamp-1">{alert.title}</CardTitle>
              <p className="text-sm text-muted-foreground">ID: {alert.alertId}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={getStatusColor(alert.status)} className="text-xs">
              {getStatusIcon(alert.status)}
              <span className="ml-1 capitalize">{alert.status}</span>
            </Badge>
            <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
              <span className="capitalize">{alert.priority}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {alert.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(alert.createdAt)}</span>
          </div>
          
          {alert.estimatedResolutionTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ETA:</span>
              <span>{formatDate(alert.estimatedResolutionTime)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Scope:</span>
            <span>{getVisibilityText(alert.visibility)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created by:</span>
            <span>{alert.createdBy.userName}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
export default AlertCard
