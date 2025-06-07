"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent, DashboardGrid, StatsCard, DashboardCard } from "@/components/dashboard/dashboard-content"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActiveAlertsWidget } from "@/components/alerts/resident/ActiveAlertsWidget"
import { AlertStatsSummary } from "@/components/alerts/resident/AlertStatsSummary"
import { UrgentAlertsPanel } from "@/components/alerts/resident/UrgentAlertsPanel"
import {
  CreditCard,
  MessageSquare,
  Bell,
  Calendar,
  ArrowRight,
  Receipt,
  FileText,
  Phone,
  Shield,
} from "lucide-react"

export default function ResidentDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }
  const statsData = [
    {
      title: "Pending Bills",
      value: "2",
      description: "Due this month",
      icon: CreditCard,
      trend: { value: "1", isPositive: false },
    },
    {
      title: "Active Alerts",
      value: "3",
      description: "Require attention",
      icon: Shield,
      trend: { value: "1", isPositive: false },
    },
    {
      title: "Active Complaints",
      value: "1",
      description: "In progress",
      icon: MessageSquare,
      trend: { value: "0", isPositive: true },
    },
    {
      title: "Unread Notices",
      value: "3",
      description: "New announcements",
      icon: Bell,
      trend: { value: "2", isPositive: false },
    },
  ]

  const recentBills = [
    {
      id: "1",
      type: "Maintenance",
      amount: "₹5,500",
      dueDate: "March 31, 2024",
      status: "pending",
    },
    {
      id: "2",
      type: "Parking Fee",
      amount: "₹3,000",
      dueDate: "March 31, 2024",
      status: "pending",
    },
    {
      id: "3",
      type: "Maintenance",
      amount: "₹5,500",
      dueDate: "February 28, 2024",
      status: "paid",
    },
  ]

  const recentComplaints = [
    {
      id: "1",
      title: "AC not working in bedroom",
      status: "in-progress",
      submittedOn: "March 25, 2024",
      assignedTo: "Maintenance Team",
    },
    {
      id: "2",
      title: "Water pressure issue",
      status: "resolved",
      submittedOn: "March 20, 2024",
      resolvedOn: "March 22, 2024",
    },
  ]

  const upcomingEvents = [
    {
      title: "Society Monthly Meeting",
      date: "April 5, 2024",
      time: "7:00 PM",
      venue: "Community Hall",
    },
    {
      title: "Holi Celebration",
      date: "March 29, 2024",
      time: "6:00 PM",
      venue: "Society Garden",
    },
  ]

  const recentNotices = [
    {
      title: "Water Supply Disruption",
      date: "March 26, 2024",
      priority: "high",
      isRead: false,
    },
    {
      title: "Parking Guidelines Update",
      date: "March 24, 2024",
      priority: "medium",
      isRead: false,
    },
    {
      title: "Society Meeting Minutes",
      date: "March 22, 2024",
      priority: "low",
      isRead: true,
    },
  ]

  return (
    <DashboardLayout
      userName={user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
      userEmail={user.email}
      notifications={8}
    >
      <DashboardContent
        title={`Welcome back, ${user.firstName || 'Resident'}!`}
        description="Here's an overview of your society activities and pending tasks."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/resident/alerts')}>
              <Shield className="h-4 w-4 mr-2" />
              View Alerts
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/resident/complaints')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              File Complaint
            </Button>
            <Button size="sm" onClick={() => router.push('/resident/billing')}>
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Bills
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
          {/* Active Alerts Widget */}
          <ActiveAlertsWidget />

          {/* Recent Bills */}
          <DashboardCard
            title="Recent Bills"
            description="Your latest billing information"
            icon={Receipt}
            actions={
              <Button variant="ghost" size="sm" onClick={() => router.push('/resident/billing')}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{bill.type}</h4>
                      <Badge
                        variant={bill.status === "pending" ? "destructive" : "secondary"}
                      >
                        {bill.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Due: {bill.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{bill.amount}</p>
                    {bill.status === "pending" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 h-7 text-xs"
                        onClick={() => router.push('/resident/billing')}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* My Complaints */}
          <DashboardCard
            title="My Complaints"
            description="Track your complaint status"
            icon={MessageSquare}
          >
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-3 rounded-lg border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{complaint.title}</h4>
                    <Badge
                      variant={
                        complaint.status === "in-progress" ? "default" : "secondary"
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {complaint.submittedOn}
                  </p>
                  {complaint.status === "in-progress" && (
                    <p className="text-xs text-blue-600">
                      Assigned to: {complaint.assignedTo}
                    </p>
                  )}
                  {complaint.resolvedOn && (
                    <p className="text-xs text-green-600">
                      Resolved: {complaint.resolvedOn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Recent Notices */}
          <DashboardCard
            title="Recent Notices"
            description="Important announcements"
            icon={Bell}
            actions={
              <Button variant="ghost" size="sm" onClick={() => router.push('/resident/notices')}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {recentNotices.map((notice, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    !notice.isRead ? "bg-accent/50" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{notice.title}</h4>
                        {!notice.isRead && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{notice.date}</p>
                    </div>
                    <Badge
                      variant={
                        notice.priority === "high"
                          ? "destructive"
                          : notice.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {notice.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Additional Information */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Alert Statistics */}
          <AlertStatsSummary />

          {/* Urgent Alerts Panel */}
          <UrgentAlertsPanel />

          {/* Upcoming Events */}
          <DashboardCard
            title="Upcoming Events"
            description="Society events and meetings"
            icon={Calendar}
          >
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      📍 {event.venue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard
            title="Quick Actions"
            description="Frequently used services"
            icon={FileText}
          >
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => router.push('/resident/alerts')}
              >
                <Shield className="h-6 w-6" />
                <span className="text-sm">View Alerts</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => router.push('/resident/billing')}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Pay Bills</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push('/resident/complaints')}>
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">File Complaint</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push('/resident/emergency')}>
                <Phone className="h-6 w-6" />
                <span className="text-sm">Emergency</span>
              </Button>
            </div>
          </DashboardCard>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
