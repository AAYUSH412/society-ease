"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search, Filter, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

export interface ReviewFiltersProps {
  filters: {
    search: string
    severity: string
    priority: string
    reporter: string
    dateRange: DateRange | undefined
    vehicleType: string
  }
  onFiltersChange: (filters: any) => void
  onReset: () => void
  violationCategories: string[]
  reporterTypes: string[]
}

export function ReviewFilters({
  filters,
  onFiltersChange,
  onReset,
  violationCategories,
  reporterTypes
}: ReviewFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>(filters.dateRange)

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search violations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select
              value={filters.severity}
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reporter Type */}
          <div className="space-y-2">
            <Label>Reporter</Label>
            <Select
              value={filters.reporter}
              onValueChange={(value) => handleFilterChange('reporter', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All reporters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All reporters</SelectItem>
                {reporterTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select
              value={filters.vehicleType}
              onValueChange={(value) => handleFilterChange('vehicleType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All vehicles</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
