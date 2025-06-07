"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { ViolationTypeIcon } from "@/components/shared/violation-type-icon"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
} from "lucide-react"

interface ViolationFiltersProps {
  filters: {
    status: string
    type: string
    severity: string
    dateRange: any
  }
  onFiltersChange: (filters: any) => void
}

export function ViolationFilters({ filters, onFiltersChange }: ViolationFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [reporterFilter, setReporterFilter] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

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

  const severityLevels = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  ]

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-800" },
    { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
    { value: "dismissed", label: "Dismissed", color: "bg-gray-100 text-gray-800" },
  ]

  const commonLocations = [
    "Main Gate",
    "Club House",
    "Swimming Pool",
    "Gym Area",
    "Children's Park",
    "Visitor Parking",
    "Building A",
    "Building B",
    "Building C",
  ]

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setLocationFilter("")
    setReporterFilter("")
    onFiltersChange({
      status: "",
      type: "",
      severity: "",
      dateRange: null,
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.status) count++
    if (filters.type) count++
    if (filters.severity) count++
    if (filters.dateRange) count++
    if (searchQuery) count++
    if (locationFilter) count++
    if (reporterFilter) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter violations by status, type, severity, and other criteria
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {isExpanded ? "Less" : "More"} Filters
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search violations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="severity">Severity</Label>
            <Select value={filters.severity} onValueChange={(value) => handleFilterChange("severity", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severities</SelectItem>
                {severityLevels.map((severity) => (
                  <SelectItem key={severity.value} value={severity.value}>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`h-3 w-3 ${
                        severity.value === "high" ? "text-red-500" :
                        severity.value === "medium" ? "text-yellow-500" : "text-green-500"
                      }`} />
                      <span>{severity.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateRange">Date Range</Label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(dateRange) => handleFilterChange("dateRange", dateRange)}
              placeholder="Select date range"
            />
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="border-t pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="type">Violation Type</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {violationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center space-x-2">
                            <ViolationTypeIcon type={type} className="h-4 w-4" />
                            <span>{type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Locations</SelectItem>
                      {commonLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reporter">Reporter</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reporter"
                      placeholder="Filter by reporter..."
                      value={reporterFilter}
                      onChange={(e) => setReporterFilter(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Filter Tags */}
              <div className="mt-4">
                <Label className="text-sm font-medium">Quick Filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("status", "pending")}
                    className={filters.status === "pending" ? "bg-yellow-100 border-yellow-300" : ""}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                    Pending Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("severity", "high")}
                    className={filters.severity === "high" ? "bg-red-100 border-red-300" : ""}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                    High Priority
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("dateRange", {
                      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      to: new Date()
                    })}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Last 7 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("type", "unauthorized_parking")}
                    className={filters.type === "unauthorized_parking" ? "bg-blue-100 border-blue-300" : ""}
                  >
                    Most Common
                  </Button>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Active Filters:</div>
                  <div className="flex flex-wrap gap-2">
                    {filters.status && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Status: {filters.status}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0"
                          onClick={() => handleFilterChange("status", "")}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    {filters.type && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Type: {filters.type.replace("_", " ")}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0"
                          onClick={() => handleFilterChange("type", "")}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    {filters.severity && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Severity: {filters.severity}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0"
                          onClick={() => handleFilterChange("severity", "")}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
