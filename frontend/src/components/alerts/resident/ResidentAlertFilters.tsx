'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { 
  Search, 
  Filter, 
  CalendarIcon, 
  X,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarScheduled
} from 'lucide-react'
import { ResidentAlertFilters } from '@/lib/api/resident-alerts'
import { ResidentAlertTypeIcon } from './ResidentAlertTypeIcon'

interface ResidentAlertFiltersProps {
  filters: ResidentAlertFilters
  onFiltersChange: (filters: ResidentAlertFilters) => void
  onClearFilters: () => void
  loading?: boolean
}

const ALERT_TYPES = [
  { value: 'water', label: 'Water Supply' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'gas', label: 'Gas Supply' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'internet', label: 'Internet/Cable' },
  { value: 'general', label: 'General' }
] as const

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
  { value: 'scheduled', label: 'Scheduled', icon: CalendarScheduled, color: 'text-blue-600' },
  { value: 'cancelled', label: 'Cancelled', icon: X, color: 'text-gray-600' }
] as const

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
] as const

export const ResidentAlertFiltersComponent: React.FC<ResidentAlertFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [dateFrom, setDateFrom] = React.useState<Date>()
  const [dateTo, setDateTo] = React.useState<Date>()

  const updateFilter = (key: keyof ResidentAlertFilters, value: string | string[] | undefined) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearDateFilter = (type: 'from' | 'to') => {
    if (type === 'from') {
      setDateFrom(undefined)
      updateFilter('dateFrom', '')
    } else {
      setDateTo(undefined)
      updateFilter('dateTo', '')
    }
  }

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.type ||
      filters.status ||
      filters.priority ||
      filters.dateFrom ||
      filters.dateTo
    )
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filter Alerts</CardTitle>
            {hasActiveFilters() && (
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          {hasActiveFilters() && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search alerts by title or description..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Status Filters */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => {
              const IconComponent = status.icon
              const isSelected = filters.status === status.value
              return (
                <Button
                  key={status.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => 
                    updateFilter('status', isSelected ? '' : status.value)
                  }
                  className="flex items-center gap-1"
                >
                  <IconComponent className={`h-3 w-3 ${isSelected ? '' : status.color}`} />
                  {status.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type">Alert Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => updateFilter('type', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ALERT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <ResidentAlertTypeIcon type={type.value} className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => updateFilter('priority', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITY_OPTIONS.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priority.color.replace('text-', 'bg-').replace('-800', '-600')}`} />
                    {priority.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !dateFrom && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date)
                    updateFilter('dateFrom', date?.toISOString().split('T')[0] || '')
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dateFrom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearDateFilter('from')}
                className="w-full"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !dateTo && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date)
                    updateFilter('dateTo', date?.toISOString().split('T')[0] || '')
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dateTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearDateFilter('to')}
                className="w-full"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort by</Label>
            <Select
              value={filters.sortBy || 'createdDate'}
              onValueChange={(value) => updateFilter('sortBy', value)}
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
            <Label htmlFor="sortOrder">Order</Label>
            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => updateFilter('sortOrder', value)}
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
  )
}
