"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Filter, X, Search } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface FineFiltersProps {
  filters: {
    search: string
    status: string
    paymentStatus: string
    violationType: string
    residentId: string
    dateRange: DateRange | undefined
    amountRange: {
      min: number
      max: number
    }
  }
  onFiltersChange: (filters: any) => void
  onReset: () => void
}

export function FineFilters({ filters, onFiltersChange, onReset }: FineFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>(filters.dateRange)

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range)
    handleFilterChange('dateRange', range)
  }

  const clearFilters = () => {
    setDate(undefined)
    onReset()
  }

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
    { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
    { value: "waived", label: "Waived", color: "bg-gray-100 text-gray-800" },
    { value: "disputed", label: "Disputed", color: "bg-blue-100 text-blue-800" },
  ]

  const paymentStatusOptions = [
    { value: "unpaid", label: "Unpaid" },
    { value: "paid", label: "Paid" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "failed", label: "Failed" },
  ]

  const violationTypes = [
    "unauthorized_parking",
    "blocking_entrance", 
    "double_parking",
    "handicap_violation",
    "visitor_parking_abuse",
    "expired_permit",
    "no_permit",
    "fire_lane_parking",
  ]

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'string') return value !== ''
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0
    return false
  }).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Fines
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
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
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by resident name, violation ID, or vehicle number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center">
                      <Badge className={`mr-2 ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => handleFilterChange('paymentStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All payment statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All payment statuses</SelectItem>
                {paymentStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Violation Type Filter */}
          <div className="space-y-2">
            <Label>Violation Type</Label>
            <Select
              value={filters.violationType}
              onValueChange={(value) => handleFilterChange('violationType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All violation types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All violation types</SelectItem>
                {violationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Amount Range Filter */}
        <div className="space-y-2">
          <Label>Fine Amount Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.amountRange.min || ''}
                onChange={(e) => handleFilterChange('amountRange', {
                  ...filters.amountRange,
                  min: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max Amount</Label>
              <Input
                type="number"
                placeholder="10000"
                value={filters.amountRange.max || ''}
                onChange={(e) => handleFilterChange('amountRange', {
                  ...filters.amountRange,
                  max: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
