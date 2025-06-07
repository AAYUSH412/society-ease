'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

interface AlertFiltersProps {
  searchTerm: string
  filterStatus: string
  filterType: string
  filterPriority: string
  dateRange?: string
  createdBy?: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onDateRangeChange?: (value: string) => void
  onCreatedByChange?: (value: string) => void
  onClearFilters: () => void
  showExtendedFilters?: boolean
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({
  searchTerm,
  filterStatus,
  filterType,
  filterPriority,
  dateRange,
  createdBy,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onPriorityChange,
  onDateRangeChange,
  onCreatedByChange,
  onClearFilters,
  showExtendedFilters = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${showExtendedFilters ? '6' : '5'} gap-4`}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
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

          <Select value={filterPriority} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {showExtendedFilters && onDateRangeChange && (
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          )}

          {showExtendedFilters && onCreatedByChange && (
            <Select value={createdBy} onValueChange={onCreatedByChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
