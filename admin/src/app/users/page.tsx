"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Users, UserCheck, UserX, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { UserStatsCards } from "@/components/users/user-stats-cards"
import { UserFilters } from "@/components/users/user-filters"
import { UserTable } from "@/components/users/user-table"
import { UserPagination } from "@/components/users/user-pagination"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { ViewUserDialog } from "@/components/users/view-user-dialog"
import { adminApi, User, handleApiError } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface UserStats {
  statusStats: Array<{ _id: string; count: number }>
  roleStats: Array<{ _id: string; count: number }>
  totalUsers: number
  recentRegistrations: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalUsers: number
  hasNext: boolean
  hasPrev: boolean
}

interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  flatNumber: string
  building?: string
  societyName: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
}

interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  flatNumber?: string
  building?: string
  societyName?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
}

export default function UsersPage() {
  const { user: currentUser, isAuthenticated } = useAuth()
  
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  })

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // API functions
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params: {
        page: number
        limit: number
        search?: string
        status?: string
        role?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
      } = {
        page: pagination.currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (searchQuery) params.search = searchQuery
      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      if (roleFilter && roleFilter !== "all") params.role = roleFilter

      // Apply tab-specific filters
      switch (activeTab) {
        case "pending":
          params.status = "pending"
          break
        case "approved":
          params.status = "approved"
          break
        case "suspended":
          params.status = "suspended"
          break
      }

      const response = await adminApi.getAllUsers(params)
      
      if (response.success && response.data) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      } else {
        toast.error(response.message || "Failed to fetch users")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, searchQuery, statusFilter, roleFilter, activeTab])

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const response = await adminApi.getUserStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Effects
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Event handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setRoleFilter("all")
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      const response = await adminApi.createResident(userData)
      
      if (response.success) {
        toast.success("User created successfully")
        setCreateDialogOpen(false)
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to create user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleUpdateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      const response = await adminApi.updateUser(userId, userData)
      
      if (response.success) {
        toast.success("User updated successfully")
        setEditDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error(response.message || "Failed to update user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const response = await adminApi.updateUserRole(userId, role as 'resident' | 'admin' | 'super_admin')
      
      if (response.success) {
        toast.success("User role updated successfully")
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to update user role")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await adminApi.deleteUser(userId)
      
      if (response.success) {
        toast.success("User deleted successfully")
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to delete user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await adminApi.approveUser(userId)
      
      if (response.success) {
        toast.success("User approved successfully")
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to approve user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      const response = await adminApi.rejectUser(userId)
      
      if (response.success) {
        toast.success("User rejected successfully")
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to reject user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await adminApi.suspendUser(userId)
      
      if (response.success) {
        toast.success("User suspended successfully")
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to suspend user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleReactivateUser = async (userId: string) => {
    try {
      const response = await adminApi.reactivateUser(userId)
      
      if (response.success) {
        toast.success("User reactivated successfully")
        fetchUsers()
        fetchStats()
      } else {
        toast.error(response.message || "Failed to reactivate user")
      }
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  // Check authentication and permissions
  if (!isAuthenticated || !currentUser) {
    return (
      <DashboardLayout
        userRole="admin"
        userName="Guest"
        userEmail=""
      >
        <DashboardContent title="Access Denied">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
    return (
      <DashboardLayout
        userRole={currentUser.role}
        userName={`${currentUser.firstName} ${currentUser.lastName}`}
        userEmail={currentUser.email}
      >
        <DashboardContent title="Access Denied">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole={currentUser.role === 'super_admin' ? 'admin' : currentUser.role}
      userName={`${currentUser.firstName} ${currentUser.lastName}`}
      userEmail={currentUser.email}
    >
      <DashboardContent 
        title="User Management"
        description="Manage and monitor all users in your society"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <UserStatsCards 
            stats={stats} 
            loading={statsLoading} 
          />

          {/* User Management Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="suspended" className="flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Suspended
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {/* Filters */}
              <UserFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                roleFilter={roleFilter}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onRoleChange={setRoleFilter}
                onClearFilters={handleClearFilters}
              />

              {/* Users Table */}
              <UserTable
                users={users}
                loading={loading}
                currentUser={currentUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onSuspendUser={handleSuspendUser}
                onReactivateUser={handleReactivateUser}
                onViewUser={handleViewUser}
              />

              {/* Pagination */}
              <UserPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalUsers={pagination.totalUsers}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
                onPageChange={handlePageChange}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreateUser={handleCreateUser}
        />

        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onUpdateUser={handleUpdateUser}
          onUpdateRole={handleUpdateRole}
          currentUser={currentUser}
        />

        <ViewUserDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          user={selectedUser}
        />
      </DashboardContent>
    </DashboardLayout>
  )
}