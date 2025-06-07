'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <DashboardLayout 
      userRole="admin" 
      userName="Admin User" 
      userEmail="admin@example.com"
      notifications={0}
    >
      {children}
    </DashboardLayout>
  )
}

export default AdminLayout
