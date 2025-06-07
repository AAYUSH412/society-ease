'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  AlertTriangle, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  ResidentAlert,
  ResidentAlertFilters,
  getResidentAlerts
} from '@/lib/api/resident-alerts'
import { ResidentAlertCard } from '@/components/alerts/resident/ResidentAlertCard'
import { ResidentAlertFiltersComponent } from '@/components/alerts/resident/ResidentAlertFilters'
import { ResidentAlertForm } from '@/components/alerts/resident/ResidentAlertForm'
import { QuickAlertActions } from '@/components/alerts/resident/QuickAlertActions'
import { DashboardLayout } from '@/components/dashboard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export default function ResidentAlertsPage() {
  const [alerts, setAlerts] = useState<ResidentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlerts: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Filter and view states
  const [filters, setFilters] = useState<ResidentAlertFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdDate',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<ResidentAlert | null>(null)
  const [quickSearch, setQuickSearch] = useState('')

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getResidentAlerts(filters)
      
      if (response.success && response.data) {
        setAlerts(response.data.alerts)
        setPagination(response.data.pagination)
      } else {
        setError(response.message || 'Failed to fetch alerts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleFiltersChange = (newFilters: ResidentAlertFilters) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'createdDate',
      sortOrder: 'desc'
    })
    setQuickSearch('')
  }

  const handleQuickSearch = (value: string) => {
    setQuickSearch(value)
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleAlertAction = (action: string, alert: ResidentAlert) => {
    // Refresh alerts after any action
    fetchAlerts()
    
    // Close selected alert if it was the one acted upon
    if (selectedAlert?._id === alert._id) {
      setSelectedAlert(null)
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    fetchAlerts()
    // Could navigate to the new alert details
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.type) count++
    if (filters.status) count++
    if (filters.priority) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    return count
  }

  return (
    <DashboardLayout
      userName="John Doe" // TODO: Get from auth context
      userEmail="john@example.com" // TODO: Get from auth context
      notifications={3}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            View and manage alerts affecting your residence
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Report Alert
          </Button>
        </div>
      </div>

      {/* Quick Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts by title or description..."
                value={quickSearch}
                onChange={(e) => handleQuickSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Filter Alerts</SheetTitle>
                  <SheetDescription>
                    Customize which alerts you want to see
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <ResidentAlertFiltersComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    loading={loading}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{pagination.totalAlerts}</p>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.status === 'scheduled').length}
                </p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.status === 'resolved').length}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Alerts List */}
        <div className="xl:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Alerts</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchAlerts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {getActiveFilterCount() > 0
                      ? 'No alerts match your current filters.'
                      : 'No alerts are currently affecting your residence.'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {getActiveFilterCount() > 0 && (
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    )}
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Report New Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Alerts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {alerts.map((alert) => (
                  <ResidentAlertCard
                    key={alert._id}
                    alert={alert}
                    onView={setSelectedAlert}
                    showActions={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages}
                        {' '}({pagination.totalAlerts} total alerts)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="xl:col-span-1">
          {selectedAlert ? (
            <QuickAlertActions
              alert={selectedAlert}
              onSuccess={handleAlertAction}
              isOwner={selectedAlert.createdBy.userRole === 'resident'}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select an alert to see available actions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report New Alert</DialogTitle>
          </DialogHeader>
          <ResidentAlertForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}
