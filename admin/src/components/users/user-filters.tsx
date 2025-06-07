"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface UserFiltersProps {
  searchQuery: string
  statusFilter: string
  roleFilter: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onRoleChange: (value: string) => void
  onClearFilters: () => void
}

export function UserFilters({
  searchQuery,
  statusFilter,
  roleFilter,
  onSearchChange,
  onStatusChange,
  onRoleChange,
  onClearFilters
}: UserFiltersProps) {
  const hasActiveFilters = searchQuery || statusFilter || roleFilter

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 items-center">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="resident">Resident</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
