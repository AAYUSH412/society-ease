'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Alert, AlertStats, getAlerts, getAlertStats, deleteAlert } from '@/lib/api/alerts'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertStatusBadge } from '@/components/alerts/AlertStatusBadge'
import { AlertPriorityBadge } from '@/components/alerts/AlertPriorityBadge'
import { AlertTypeIcon } from '@/components/alerts/AlertTypeIcon'
import { AlertDeleteDialog } from '@/components/alerts/AlertDeleteDialog'
import { 
  ArrowLeft,
  Eye,
  Edit,
  RefreshCw,
  FileDown,
  MoreHorizontal,
  Search,
  Trash2,
  CheckCircle,
  Archive
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const AlertManagementPage: React.FC = () => {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')

  // Load alerts and stats
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [alertsResponse, statsResponse] = await Promise.all([
        getAlerts({ page: 1, limit: 1000 }), // Load all alerts for management
        getAlertStats()
      ])

      if (alertsResponse.success && alertsResponse.data) {
        // The API returns { data: { alerts: [], pagination: {} } }
        setAlerts(alertsResponse.data.alerts || [])
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const applyFilters = useCallback(() => {
    if (!alerts.length) {
      setFilteredAlerts([])
      return
    }
    
    let filtered = [...alerts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alertId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.status === filterStatus)
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(alert => alert.priority === filterPriority)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      if (dateRange !== 'all') {
        filtered = filtered.filter(alert => new Date(alert.createdDate) >= filterDate)
      }
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, filterStatus, filterType, filterPriority, dateRange])

  // Filter alerts when filters change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    const newSelection = new Set(selectedAlerts)
    if (checked) {
      newSelection.add(alertId)
    } else {
      newSelection.delete(alertId)
    }
    setSelectedAlerts(newSelection)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(new Set(filteredAlerts.map(alert => alert.alertId)))
    } else {
      setSelectedAlerts(new Set())
    }
  }

  const handleBulkResolve = async () => {
    console.log('Bulk resolve alerts:', Array.from(selectedAlerts))
    // TODO: Implement bulk resolve
    setSelectedAlerts(new Set())
  }

  const handleBulkArchive = async () => {
    console.log('Bulk archive alerts:', Array.from(selectedAlerts))
    // TODO: Implement bulk archive
    setSelectedAlerts(new Set())
  }

  const handleBulkDelete = async () => {
    console.log('Bulk delete alerts:', Array.from(selectedAlerts))
    // TODO: Implement bulk delete
    setSelectedAlerts(new Set())
  }

  const handleViewAlert = (alertId: string) => {
    router.push(`/admin/alerts/${alertId}`)
  }

  const handleEditAlert = (alertId: string) => {
    router.push(`/admin/alerts/${alertId}`)
  }

  const handleDeleteAlert = (alert: Alert) => {
    setAlertToDelete(alert)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteAlert = async () => {
    if (!alertToDelete) return
    
    try {
      const response = await deleteAlert(alertToDelete.alertId)
      if (response.success) {
        await refreshData()
      } else {
        console.error('Failed to delete alert:', response.message)
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    } finally {
      setDeleteDialogOpen(false)
      setAlertToDelete(null)
    }
  }

  const exportAlerts = () => {
    console.log('Exporting alerts...')
    // TODO: Implement export functionality
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterType('all')
    setFilterPriority('all')
    setDateRange('all')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/alerts')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Alerts
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
              <p className="text-sm text-gray-500">Manage and organize all system alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportAlerts}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
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

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
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

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedAlerts.size > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedAlerts.size} alert{selectedAlerts.size === 1 ? '' : 's'} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlerts(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkResolve}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkArchive}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alerts ({filteredAlerts.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-500">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No alerts found matching your criteria.</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedAlerts.has(alert.alertId)}
                      onCheckedChange={(checked) => handleSelectAlert(alert.alertId, checked as boolean)}
                    />
                    
                    <div className="flex items-center gap-2">
                      <AlertTypeIcon type={alert.type} className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{alert.title}</h3>
                        <AlertStatusBadge status={alert.status} />
                        <AlertPriorityBadge priority={alert.priority} />
                      </div>
                      <p className="text-sm text-gray-500 truncate">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>ID: {alert.alertId}</span>
                        <span>Created: {format(new Date(alert.createdDate), 'MMM d, yyyy')}</span>
                        <span>Updated: {formatDistanceToNow(new Date(alert.updatedAt))} ago</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAlert(alert.alertId)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewAlert(alert.alertId)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditAlert(alert.alertId)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Alert
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAlert(alert)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Alert
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteAlert}
          loading={false}
          alertTitle={alertToDelete?.title || ''}
        />
      </div>
    </AdminLayout>
  )
}

export default AlertManagementPage