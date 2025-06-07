'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellRing, 
  ArrowLeft, 
  Search, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Archive,
  Star,
  MoreVertical,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ResidentAlert, getResidentAlerts, acknowledgeAlert } from '@/lib/api/resident-alerts'
import { ResidentAlertTypeIcon } from '@/components/alerts/resident/ResidentAlertTypeIcon'
import { ResidentAlertPriorityBadge } from '@/components/alerts/resident/ResidentAlertPriorityBadge'
import { ResidentAlertStatusBadge } from '@/components/alerts/resident/ResidentAlertStatusBadge'

interface NotificationFilters {
  status?: 'active' | 'resolved' | 'scheduled' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  type?: 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
  search?: string
  dateRange?: string
}

interface NotificationStats {
  total: number
  unread: number
  active: number
  resolved: number
  critical: number
  thisWeek: number
}

const AlertNotificationsPage: React.FC = () => {
  const router = useRouter()
  const [notifications, setNotifications] = useState<ResidentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    active: 0,
    resolved: 0,
    critical: 0,
    thisWeek: 0
  })
  const [filters, setFilters] = useState<NotificationFilters>({})
  const [selectedTab, setSelectedTab] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Simple localStorage-based read tracking (in production, this would be server-side)
  const isAlertRead = useCallback((alertId: string): boolean => {
    const readAlerts = JSON.parse(localStorage.getItem('readAlerts') || '[]')
    return readAlerts.includes(alertId)
  }, [])

  const calculateStats = useCallback((alerts: ResidentAlert[]) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const statsData = {
      total: alerts.length,
      unread: alerts.filter(alert => !isAlertRead(alert._id)).length,
      active: alerts.filter(alert => alert.status === 'active').length,
      resolved: alerts.filter(alert => alert.status === 'resolved').length,
      critical: alerts.filter(alert => alert.priority === 'critical').length,
      thisWeek: alerts.filter(alert => 
        new Date(alert.createdDate) >= oneWeekAgo
      ).length
    }
    
    setStats(statsData)
  }, [isAlertRead])

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getResidentAlerts({
        ...filters,
        limit: 50,
        sortBy: 'createdDate',
        sortOrder: 'desc'
      })
      
      if (response.success && response.data) {
        const alerts = response.data.alerts
        setNotifications(alerts)
        calculateStats(alerts)
      } else {
        setError(response.message || 'Failed to fetch notifications')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, calculateStats])

  const markAsRead = useCallback(async (alertId: string) => {
    const readAlerts = JSON.parse(localStorage.getItem('readAlerts') || '[]')
    if (!readAlerts.includes(alertId)) {
      readAlerts.push(alertId)
      localStorage.setItem('readAlerts', JSON.stringify(readAlerts))
      // Recalculate stats
      calculateStats(notifications)
    }
  }, [notifications, calculateStats])

  const handleAcknowledge = useCallback(async (alertId: string) => {
    try {
      setActionLoading(alertId)
      const response = await acknowledgeAlert(alertId)
      
      if (response.success) {
        // Mark as read and refresh notifications
        await markAsRead(alertId)
        await fetchNotifications()
      } else {
        setError(response.message || 'Failed to acknowledge alert')
      }
    } catch (error) {
      setError('Failed to acknowledge alert')
      console.error('Error acknowledging alert:', error)
    } finally {
      setActionLoading(null)
    }
  }, [markAsRead, fetchNotifications])

  const handleMarkAllAsRead = useCallback(async () => {
    const allAlertIds = notifications.map(alert => alert._id)
    const readAlerts = JSON.parse(localStorage.getItem('readAlerts') || '[]')
    const newReadAlerts = [...new Set([...readAlerts, ...allAlertIds])]
    localStorage.setItem('readAlerts', JSON.stringify(newReadAlerts))
    calculateStats(notifications)
  }, [notifications, calculateStats])

  const getFilteredNotifications = useCallback(() => {
    let filtered = notifications

    // Filter by tab
    switch (selectedTab) {
      case 'unread':
        filtered = filtered.filter(alert => !isAlertRead(alert._id))
        break
      case 'active':
        filtered = filtered.filter(alert => alert.status === 'active')
        break
      case 'critical':
        filtered = filtered.filter(alert => alert.priority === 'critical')
        break
      default:
        break
    }

    // Apply additional filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status)
    }

    if (filters.priority) {
      filtered = filtered.filter(alert => alert.priority === filters.priority)
    }

    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type)
    }

    return filtered
  }, [notifications, selectedTab, filters, isAlertRead])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with all society alerts and announcements
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark All Read</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value as 'active' | 'resolved' | 'scheduled' | 'cancelled'
                }))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  priority: value === 'all' ? undefined : value as 'low' | 'medium' | 'high' | 'critical'
                }))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  type: value === 'all' ? undefined : value as 'water' | 'electricity' | 'gas' | 'general' | 'maintenance' | 'security' | 'internet'
                }))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {Object.keys(filters).some(key => filters[key as keyof NotificationFilters]) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({stats.critical})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {getFilteredNotifications().length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600">
                  {selectedTab === 'all' 
                    ? "There are no notifications to display." 
                    : `No ${selectedTab} notifications found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredNotifications().map((notification) => (
                <Card
                  key={notification._id}
                  className={`transition-all hover:shadow-md cursor-pointer ${
                    !isAlertRead(notification._id) ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification._id)
                    router.push(`/resident/alerts/${notification._id}`)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <ResidentAlertTypeIcon 
                            type={notification.type} 
                            className="h-6 w-6" 
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            {!isAlertRead(notification._id) && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {notification.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(notification.createdDate)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{notification.createdBy.userName}</span>
                            </div>
                            
                            {notification.updates.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{notification.updates.length} updates</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <ResidentAlertPriorityBadge priority={notification.priority} />
                        <ResidentAlertStatusBadge status={notification.status} />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification._id)
                                router.push(`/resident/alerts/${notification._id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification._id)
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                            
                            {notification.status === 'active' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAcknowledge(notification._id)
                                  }}
                                  disabled={actionLoading === notification._id}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  {actionLoading === notification._id ? 'Acknowledging...' : 'Acknowledge'}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AlertNotificationsPage
