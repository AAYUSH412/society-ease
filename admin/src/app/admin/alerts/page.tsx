'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Alert, AlertStats, getAlerts, getAlertStats } from '@/lib/api/alerts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { AlertFilters } from '@/components/alerts/AlertFilters'
import { AlertStatusBadge } from '@/components/alerts/AlertStatusBadge'
import { AlertPriorityBadge } from '@/components/alerts/AlertPriorityBadge'
import { AlertTypeIcon } from '@/components/alerts/AlertTypeIcon'

const AlertDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [alertsResponse, statsResponse] = await Promise.all([
        getAlerts(),
        getAlertStats()
      ])

      console.log('Alerts Response:', alertsResponse)
      console.log('Stats Response:', statsResponse)

      if (alertsResponse.success && alertsResponse.data) {
        // The API returns { data: { alerts: [], pagination: {} } }
        const alertsData = alertsResponse.data.alerts || []
        console.log('Setting alerts data:', alertsData)
        setAlerts(alertsData)
      } else {
        console.error('Failed to load alerts:', alertsResponse.message)
        setAlerts([])
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      } else {
        console.error('Failed to load stats:', statsResponse.message)
        setStats(null)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setAlerts([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = useCallback(() => {
    if (!Array.isArray(alerts)) return []
    
    return alerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || alert.status === filterStatus
      const matchesType = filterType === 'all' || alert.type === filterType
      const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority

      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })
  }, [alerts, searchTerm, filterStatus, filterType, filterPriority])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterType('all')
    setFilterPriority('all')
  }, [])

  const handleAlertClick = useCallback((alert: Alert) => {
    // Use alertId instead of _id for navigation
    router.push(`/admin/alerts/${alert.alertId}`)
  }, [router])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const currentFilteredAlerts = filteredAlerts()

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all society alerts</p>
          </div>
          <Button onClick={() => router.push('/admin/alerts/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time alerts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.scheduled || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled alerts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully resolved
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <AlertFilters
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          filterType={filterType}
          filterPriority={filterPriority}
          onSearchChange={setSearchTerm}
          onStatusChange={setFilterStatus}
          onTypeChange={setFilterType}
          onPriorityChange={setFilterPriority}
          onClearFilters={handleClearFilters}
        />

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              {currentFilteredAlerts.length} of {alerts.length} alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentFilteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No alerts found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentFilteredAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTypeIcon type={alert.type} />
                          <h3 className="font-semibold text-lg">{alert.title}</h3>
                          <AlertPriorityBadge priority={alert.priority} />
                          <AlertStatusBadge status={alert.status} />
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                          {alert.estimatedResolutionTime && (
                            <span>
                              ETA: {new Date(alert.estimatedResolutionTime).toLocaleDateString()}
                            </span>
                          )}
                          <span className="capitalize">Type: {alert.type}</span>
                          <span className="capitalize">
                            Scope: {alert.visibility?.scope?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AlertDashboard
