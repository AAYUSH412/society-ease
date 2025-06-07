'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react'
import { ResidentAlertForm } from '@/components/alerts/resident/ResidentAlertForm'

const CreateAlertPage: React.FC = () => {
  const router = useRouter()

  const handleAlertCreated = (alertId: string) => {
    // Redirect to the created alert's detail page
    router.push(`/resident/alerts/${alertId}`)
  }

  const handleCancel = () => {
    router.push('/resident/alerts')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report New Alert</h1>
              <p className="text-sm text-gray-600 mt-1">
                Create a new alert to report issues or notify the community about important matters.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium text-blue-900">Before Creating an Alert</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Provide clear and detailed descriptions to help management understand the issue</li>
                  <li>• Set realistic resolution time expectations</li>
                  <li>• Use appropriate priority levels - High priority should be reserved for urgent issues</li>
                  <li>• Add relevant tags to help categorize and search for your alert</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Priority Levels</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li><span className="font-medium text-red-600">High:</span> Safety issues, major outages</li>
                    <li><span className="font-medium text-orange-600">Medium:</span> General maintenance, minor issues</li>
                    <li><span className="font-medium text-green-600">Low:</span> Suggestions, non-urgent requests</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Alert Types</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li><span className="font-medium">Water:</span> Supply, leakage, quality</li>
                    <li><span className="font-medium">Electricity:</span> Power outages, faults</li>
                    <li><span className="font-medium">Maintenance:</span> Building repairs</li>
                    <li><span className="font-medium">Security:</span> Safety concerns</li>
                    <li><span className="font-medium">General:</span> Other community issues</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-xs">
                    <strong>Note:</strong> Management will review your alert and provide updates. 
                    You&apos;ll receive notifications about the progress.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Form */}
          <div className="lg:col-span-2">
            <ResidentAlertForm 
              onSuccess={handleAlertCreated}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAlertPage
