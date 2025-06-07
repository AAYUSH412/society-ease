"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, 
  Calculator, 
  Zap, 
  Car, 
  AlertTriangle, 
  Plus,
  Info
} from "lucide-react"

interface ChargeConfig {
  maintenanceAmount: number
  utilityCharges: number
  parkingFee: number
  specialAssessments: number
  lateFeePenalty: number
  otherCharges: number
  description: string
}

interface ChargesStepProps {
  charges: ChargeConfig
  onChange: (charges: ChargeConfig) => void
  billingType: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
}

const CHARGE_PRESETS = {
  maintenance: {
    maintenanceAmount: 5500,
    utilityCharges: 1200,
    parkingFee: 1000,
    specialAssessments: 0,
    lateFeePenalty: 0,
    otherCharges: 0,
    description: 'Monthly maintenance charges'
  },
  special_assessment: {
    maintenanceAmount: 0,
    utilityCharges: 0,
    parkingFee: 0,
    specialAssessments: 10000,
    lateFeePenalty: 0,
    otherCharges: 0,
    description: 'Special assessment for society improvements'
  },
  penalty: {
    maintenanceAmount: 0,
    utilityCharges: 0,
    parkingFee: 0,
    specialAssessments: 0,
    lateFeePenalty: 500,
    otherCharges: 0,
    description: 'Late payment penalty charges'
  },
  other: {
    maintenanceAmount: 0,
    utilityCharges: 0,
    parkingFee: 0,
    specialAssessments: 0,
    lateFeePenalty: 0,
    otherCharges: 1000,
    description: 'Other miscellaneous charges'
  }
}

export function ChargesStep({ charges, onChange, billingType }: ChargesStepProps) {
  const [hasCustomized, setHasCustomized] = useState(false)

  // Load preset when billing type changes
  useEffect(() => {
    if (!hasCustomized) {
      onChange(CHARGE_PRESETS[billingType])
    }
  }, [billingType, hasCustomized, onChange])

  const handleChargeChange = (field: keyof ChargeConfig, value: string | number) => {
    setHasCustomized(true)
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    onChange({
      ...charges,
      [field]: numericValue
    })
  }

  const loadPreset = (preset: keyof typeof CHARGE_PRESETS) => {
    onChange(CHARGE_PRESETS[preset])
    setHasCustomized(false)
  }

  const totalAmount = charges.maintenanceAmount + 
                     charges.utilityCharges + 
                     charges.parkingFee + 
                     charges.specialAssessments + 
                     charges.lateFeePenalty + 
                     charges.otherCharges

  const chargeItems = [
    {
      key: 'maintenanceAmount',
      label: 'Maintenance Charges',
      icon: DollarSign,
      description: 'Monthly society maintenance fee',
      value: charges.maintenanceAmount,
      color: 'text-blue-600'
    },
    {
      key: 'utilityCharges',
      label: 'Utility Charges',
      icon: Zap,
      description: 'Water, electricity, common area utilities',
      value: charges.utilityCharges,
      color: 'text-yellow-600'
    },
    {
      key: 'parkingFee',
      label: 'Parking Fee',
      icon: Car,
      description: 'Vehicle parking charges',
      value: charges.parkingFee,
      color: 'text-green-600'
    },
    {
      key: 'specialAssessments',
      label: 'Special Assessments',
      icon: Plus,
      description: 'One-time charges for improvements',
      value: charges.specialAssessments,
      color: 'text-purple-600'
    },
    {
      key: 'lateFeePenalty',
      label: 'Late Fee/Penalty',
      icon: AlertTriangle,
      description: 'Penalty for overdue payments',
      value: charges.lateFeePenalty,
      color: 'text-red-600'
    },
    {
      key: 'otherCharges',
      label: 'Other Charges',
      icon: Calculator,
      description: 'Miscellaneous fees and charges',
      value: charges.otherCharges,
      color: 'text-gray-600'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Set Charge Amounts
          </CardTitle>
          <CardDescription>
            Configure the charges for maintenance, utilities, and other fees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Presets */}
          <div className="space-y-3">
            <Label>Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CHARGE_PRESETS).map(([key]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset(key as keyof typeof CHARGE_PRESETS)}
                  className={billingType === key ? 'ring-2 ring-primary' : ''}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Charge Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chargeItems.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.key} className="relative">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        <Label className="font-medium">{item.label}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.value}
                          onChange={(e) => handleChargeChange(item.key as keyof ChargeConfig, e.target.value)}
                          className="pl-8"
                          placeholder="0.00"
                        />
                      </div>
                      {item.value > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          ₹{item.value.toLocaleString('en-IN')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="charges-description">
              Billing Description
            </Label>
            <Textarea
              id="charges-description"
              placeholder="Add a description for this billing period..."
              value={charges.description}
              onChange={(e) => handleChargeChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Total Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="font-medium text-lg">Total Amount per Bill</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per resident/flat
                  </div>
                </div>
              </div>
              
              {totalAmount > 0 && (
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Breakdown:</p>
                    {chargeItems.filter(item => item.value > 0).map(item => (
                      <div key={item.key} className="flex justify-between">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span>₹{item.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Helpful Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Helpful Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use presets to quickly set up common billing scenarios</li>
                    <li>• Maintenance charges are typically recurring monthly fees</li>
                    <li>• Special assessments are usually one-time charges</li>
                    <li>• Set parking fees to 0 if included in maintenance</li>
                    <li>• Late fees are added to overdue bills automatically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
