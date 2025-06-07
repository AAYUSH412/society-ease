"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Building2 } from "lucide-react"

interface UserStats {
  statusStats: Array<{ _id: string; count: number }>
  roleStats: Array<{ _id: string; count: number }>
  totalUsers: number
  recentRegistrations: number
}

interface UserStatsCardsProps {
  stats: UserStats | null
  loading: boolean
}

export function UserStatsCards({ stats, loading }: UserStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalUsers = stats?.totalUsers || 0
  const approvedUsers = stats?.statusStats?.find(s => s._id === 'approved')?.count || 0
  const pendingUsers = stats?.statusStats?.find(s => s._id === 'pending')?.count || 0
  const suspendedUsers = stats?.statusStats?.find(s => s._id === 'suspended')?.count || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.recentRegistrations || 0} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedUsers}</div>
          <p className="text-xs text-muted-foreground">
            {totalUsers > 0 ? Math.round((approvedUsers / totalUsers) * 100) : 0}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingUsers}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{suspendedUsers}</div>
          <p className="text-xs text-muted-foreground">
            Access restricted
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
