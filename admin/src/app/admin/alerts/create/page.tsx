'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { AlertForm } from '@/components/alerts/AlertForm'
import { Alert } from '@/lib/api/alerts'

const CreateAlertPage: React.FC = () => {
  const router = useRouter()

  const handleAlertCreated = (alert: Alert) => {
    // Redirect to the created alert's detail page
    router.push(`/admin/alerts/${alert.alertId}`)
  }

  const handleCancel = () => {
    router.push('/admin/alerts')
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Alert</h1>
              <p className="text-sm text-gray-600">
                Create a new alert to notify residents about important updates or issues.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Form */}
        <div className="max-w-7xl">
          <AlertForm 
            onSuccess={handleAlertCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export default CreateAlertPage
