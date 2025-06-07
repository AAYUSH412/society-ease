'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Users, Building, Globe, Lock } from 'lucide-react'

interface AlertVisibilityProps {
  visibility: {
    scope: 'society_wide' | 'building_specific' | 'floor_specific' | 'unit_specific'
    buildings?: string[]
    floors?: string[]
    units?: string[]
  }
  className?: string
}

export const AlertVisibility: React.FC<AlertVisibilityProps> = ({ 
  visibility, 
  className = '' 
}) => {
  const getScopeInfo = (scope: string) => {
    switch (scope) {
      case 'society_wide':
        return {
          icon: <Globe className="h-4 w-4" />,
          label: 'Society Wide',
          description: 'Visible to all residents',
          color: 'bg-blue-100 text-blue-800'
        }
      case 'building_specific':
        return {
          icon: <Building className="h-4 w-4" />,
          label: 'Building Specific',
          description: 'Visible to specific buildings',
          color: 'bg-green-100 text-green-800'
        }
      case 'floor_specific':
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'Floor Specific',
          description: 'Visible to specific floors',
          color: 'bg-orange-100 text-orange-800'
        }
      case 'unit_specific':
        return {
          icon: <Lock className="h-4 w-4" />,
          label: 'Unit Specific',
          description: 'Visible to specific units',
          color: 'bg-purple-100 text-purple-800'
        }
      default:
        return {
          icon: <Eye className="h-4 w-4" />,
          label: 'Unknown',
          description: 'Visibility scope not defined',
          color: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const scopeInfo = getScopeInfo(visibility.scope)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visibility & Scope
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={scopeInfo.color}>
            {scopeInfo.icon}
            <span className="ml-1">{scopeInfo.label}</span>
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600">{scopeInfo.description}</p>

        {visibility.buildings && visibility.buildings.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Buildings:</h4>
            <div className="flex flex-wrap gap-2">
              {visibility.buildings.map((building, index) => (
                <Badge key={index} variant="outline">
                  <Building className="h-3 w-3 mr-1" />
                  {building}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {visibility.floors && visibility.floors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Floors:</h4>
            <div className="flex flex-wrap gap-2">
              {visibility.floors.map((floor, index) => (
                <Badge key={index} variant="outline">
                  Floor {floor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {visibility.units && visibility.units.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Units:</h4>
            <div className="flex flex-wrap gap-2">
              {visibility.units.map((unit, index) => (
                <Badge key={index} variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  {unit}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
