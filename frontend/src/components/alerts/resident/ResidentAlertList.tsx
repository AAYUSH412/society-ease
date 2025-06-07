'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Filter, Calendar, RefreshCw, AlertTriangle } from 'lucide-react'
import { ResidentAlert, ResidentAlertFilters, getResidentAlerts } from '@/lib/api/resident-alerts'
import { ResidentAlertCard } from './ResidentAlertCard'

interface ResidentAlertListProps {
  onAlertView?: (alert: ResidentAlert) => void
  onAlertUpdate?: (alert: ResidentAlert) => void
  onAlertEscalate?: (alert: ResidentAlert) => void
  onAlertResolve?: (alert: ResidentAlert) => void
  currentUserId?: string
  compact?: boolean
  showFilters?: boolean
  initialFilters?: ResidentAlertFilters
  maxResults?: number
}

export const ResidentAlertList: React.FC<ResidentAlertListProps> = ({
  onAlertView,
  onAlertUpdate,
  onAlertEscalate,
  onAlertResolve,
  currentUserId,
  compact = false,
  showFilters = true,
  initialFilters = {},
  maxResults
}) => {
  const [alerts, setAlerts] = useState<ResidentAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlerts: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Filter states
  const [filters, setFilters] = useState<ResidentAlertFilters>({
    page: 1,
    limit: maxResults || 10,
    ...initialFilters
  })

  const loadAlerts = useCallback(async (newFilters?: ResidentAlertFilters) => {
    setLoading(true)
    setError(null)

    try {
      const filtersToUse = newFilters || filters
      const response = await getResidentAlerts(filtersToUse)

      if (response.success && response.data) {
        setAlerts(response.data.alerts)
        setPagination(response.data.pagination)
      } else {
        setError(response.message || 'Failed to load alerts')
        setAlerts([])
      }
    } catch (err) {
      setError('Failed to load alerts')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load alerts on component mount
  React.useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const handleFilterChange = (key: keyof ResidentAlertFilters, value: any) => {
    const newFilters = { 
      ...filters, 
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 when changing other filters
    }
    setFilters(newFilters)
    loadAlerts(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { 
      page: 1, 
      limit: maxResults || 10,
      ...initialFilters 
    }
    setFilters(clearedFilters)
    loadAlerts(clearedFilters)
  }

  const handleRefresh = () => {
    loadAlerts()
  }

  const isOwner = (alert: ResidentAlert) => {
    return currentUserId === alert.createdBy.userId
  }

  const getActiveFiltersCount = () => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (key === 'page' || key === 'limit') return false
      return value !== undefined && value !== null && value !== ''
    })
    return activeFilters.length
  }

  if (loading && alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()} active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {getActiveFiltersCount() > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sortBy || 'createdDate'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdDate">Created Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="estimatedResolutionTime">Expected Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort Order</label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Alerts ({pagination.totalAlerts})</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                {getActiveFiltersCount() > 0 
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no alerts to display at the moment.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <ResidentAlertCard
                  key={alert._id}
                  alert={alert}
                  onView={onAlertView}
                  onUpdate={onAlertUpdate}
                  onEscalate={onAlertEscalate}
                  onResolve={onAlertResolve}
                  isOwner={isOwner(alert)}
                  compact={compact}
                />
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
