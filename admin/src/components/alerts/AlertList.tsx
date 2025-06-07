'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Alert, getAlerts } from '@/lib/api/alerts'
import { AlertCard } from './AlertCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  RefreshCw,
  Download,
  Trash2,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface AlertListProps {
  compact?: boolean
  showFilters?: boolean
  showBulkActions?: boolean
  onAlertSelect?: (alerts: Alert[]) => void
  initialFilters?: {
    status?: string
    type?: string
    priority?: string
    assignedTo?: string
  }
}

export const AlertList: React.FC<AlertListProps> = ({
  compact = false,
  showFilters = true,
  showBulkActions = false,
  onAlertSelect,
  initialFilters = {}
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlerts: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Filters and search
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadAlerts = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const response = await getAlerts({
        page,
        limit: compact ? 5 : 10,
        search: search || undefined,
        ...filters
      })
      
      if (response.success && response.data) {
        setAlerts(response.data.alerts)
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalAlerts: response.data.pagination.totalAlerts,
          hasNext: response.data.pagination.hasNextPage,
          hasPrev: response.data.pagination.hasPrevPage
        })
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [compact, search, filters])

  useEffect(() => {
    loadAlerts()
  }, [search, filters, sortField, sortOrder, loadAlerts])

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    const newSelected = new Set(selectedAlerts)
    if (checked) {
      newSelected.add(alertId)
    } else {
      newSelected.delete(alertId)
    }
    setSelectedAlerts(newSelected)
    
    if (onAlertSelect) {
      const selectedAlertObjects = alerts.filter(alert => newSelected.has(alert._id))
      onAlertSelect(selectedAlertObjects)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(alerts.map(alert => alert._id))
      setSelectedAlerts(allIds)
      if (onAlertSelect) {
        onAlertSelect(alerts)
      }
    } else {
      setSelectedAlerts(new Set())
      if (onAlertSelect) {
        onAlertSelect([])
      }
    }
  }

  const clearFilters = () => {
    setSearch('')
    setFilters({})
    setSortField('createdAt')
    setSortOrder('desc')
  }

  const exportAlerts = () => {
    // Implementation for export
    toast.success('Export functionality will be implemented')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading alerts...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="notice">Notice</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, priority: value === 'all' ? undefined : value }))
                }
              >
                <SelectTrigger>
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
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadAlerts()}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportAlerts}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Sort by:
                </span>
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created</SelectItem>
                    <SelectItem value="updatedAt">Updated</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showBulkActions && selectedAlerts.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedAlerts.size} selected
                </Badge>
                <Button variant="outline" size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Mark Resolved
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedAlerts(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {showBulkActions && (
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={selectedAlerts.size === alerts.length && alerts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select all ({alerts.length})
            </span>
          </div>
        )}
        
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">
                No alerts found matching your criteria.
              </div>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className="relative">
              {showBulkActions && (
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedAlerts.has(alert._id)}
                    onCheckedChange={(checked) => 
                      handleSelectAlert(alert._id, checked as boolean)
                    }
                  />
                </div>
              )}
              <div className={showBulkActions ? 'ml-8' : ''}>
                <AlertCard
                  alert={alert}
                  showActions={true}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {!compact && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {alerts.length} of {pagination.totalAlerts} alerts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => loadAlerts(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => loadAlerts(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AlertList
