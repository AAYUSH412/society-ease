"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent, DashboardGrid, StatsCard, DashboardCard } from "@/components/dashboard/dashboard-content"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Bell,
  DollarSign,
  Clock,
  Plus,
  ArrowRight,
  Calendar,
  FileText,
} from "lucide-react"

export default function AdminDashboard() {
  const statsData = [
    {
      title: "Total Residents",
      value: "248",
      description: "Active residents",
      icon: Users,
      trend: { value: "12%", isPositive: true },
    },
    {
      title: "Monthly Revenue",
      value: "₹2,48,000",
      description: "This month",
      icon: DollarSign,
      trend: { value: "8%", isPositive: true },
    },
    {
      title: "Pending Complaints",
      value: "8",
      description: "Requires attention",
      icon: MessageSquare,
      trend: { value: "2", isPositive: false },
    },
    {
      title: "Collection Rate",
      value: "94%",
      description: "Payment collection",
      icon: TrendingUp,
      trend: { value: "3%", isPositive: true },
    },
  ]

  const recentComplaints = [
    {
      id: "1",
      title: "Water leakage in A-block",
      user: "John Doe",
      status: "pending",
      priority: "high",
      time: "2 hours ago",
    },
    {
      id: "2",
      title: "Parking space issue",
      user: "Jane Smith",
      status: "in-progress",
      priority: "medium",
      time: "4 hours ago",
    },
    {
      id: "3",
      title: "Elevator maintenance",
      user: "Mike Johnson",
      status: "resolved",
      priority: "low",
      time: "1 day ago",
    },
  ]

  const upcomingTasks = [
    {
      title: "Generate monthly bills",
      description: "Due in 2 days",
      priority: "high",
    },
    {
      title: "Society meeting preparation",
      description: "Due in 5 days",
      priority: "medium",
    },
    {
      title: "Quarterly maintenance review",
      description: "Due in 1 week",
      priority: "low",
    },
  ]

  return (
    <DashboardLayout
      userRole="admin"
      userName="Admin User"
      userEmail="admin@societyease.com"
      notifications={5}
    >
      <DashboardContent
        title="Admin Dashboard"
        description="Welcome back! Here's what's happening in your society today."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Generate Bills
            </Button>
          </div>
        }
      >
        {/* Stats Grid */}
        <DashboardGrid cols={4}>
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </DashboardGrid>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Complaints */}
          <DashboardCard
            title="Recent Complaints"
            description="Latest complaints requiring attention"
            icon={MessageSquare}
            className="lg:col-span-2"
            actions={
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            }
          >
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{complaint.title}</h4>
                      <Badge
                        variant={
                          complaint.priority === "high"
                            ? "destructive"
                            : complaint.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {complaint.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      by {complaint.user} • {complaint.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      complaint.status === "pending"
                        ? "outline"
                        : complaint.status === "in-progress"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {complaint.status}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Upcoming Tasks */}
          <DashboardCard
            title="Upcoming Tasks"
            description="Important deadlines"
            icon={Clock}
          >
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded border-l-2 border-primary/20">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "destructive"
                        : task.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Additional Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Payment Collection */}
          <DashboardCard
            title="Payment Collection Status"
            description="Monthly collection progress"
            icon={CreditCard}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Collected</span>
                  <span className="font-medium">₹2,32,800 / ₹2,48,000</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600">233</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-600">15</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard
            title="Quick Actions"
            description="Frequently used actions"
            icon={FileText}
          >
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col gap-2">
                <Bell className="h-5 w-5" />
                <span className="text-xs">Send Alert</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">Add Resident</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Generate Bill</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-xs">Create Notice</span>
              </Button>
            </div>
          </DashboardCard>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
