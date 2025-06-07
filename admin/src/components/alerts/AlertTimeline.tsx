'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, MessageSquare } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface AlertUpdate {
  _id: string
  message: string
  updateType: 'progress' | 'delay' | 'resolution' | 'escalation' | 'general'
  timestamp: string
  updatedBy: {
    userId: string
    userName: string
    userRole: string
  }
}

interface AlertTimelineProps {
  updates: AlertUpdate[]
  className?: string
}

export const AlertTimeline: React.FC<AlertTimelineProps> = ({ 
  updates, 
  className = '' 
}) => {
  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'progress':
        return 'bg-blue-100 text-blue-800'
      case 'delay':
        return 'bg-orange-100 text-orange-800'
      case 'resolution':
        return 'bg-green-100 text-green-800'
      case 'escalation':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!updates || updates.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No updates available for this alert.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline ({updates.length} updates)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div key={update._id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {index < updates.length - 1 && (
                  <div className="w-px h-16 bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getUpdateTypeColor(update.updateType)}>
                      {update.updateType.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{update.updatedBy.userName}</span>
                    <span className="text-gray-400">({update.updatedBy.userRole})</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {update.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(update.timestamp), 'PPp')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
