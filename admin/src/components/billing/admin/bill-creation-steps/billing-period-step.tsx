"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"

interface BillingPeriod {
  month: number
  year: number
  type: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  description?: string
}

interface BillingPeriodStepProps {
  value: BillingPeriod
  onChange: (value: BillingPeriod) => void
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
]

const BILL_TYPES = [
  { value: "maintenance", label: "Monthly Maintenance", description: "Regular monthly maintenance charges" },
  { value: "special_assessment", label: "Special Assessment", description: "One-time or irregular charges" },
  { value: "penalty", label: "Penalty/Late Fee", description: "Penalty charges for overdue payments" },
  { value: "other", label: "Other Charges", description: "Custom charges or fees" }
]

export function BillingPeriodStep({ value, onChange }: BillingPeriodStepProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleChange = (field: keyof BillingPeriod, newValue: string | number) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Billing Period & Type
          </CardTitle>
          <CardDescription>
            Choose the billing period and type of charges you want to generate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Billing Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Billing Month</Label>
              <Select
                value={value.month.toString()}
                onValueChange={(val) => handleChange('month', parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Billing Year</Label>
              <Select
                value={value.year.toString()}
                onValueChange={(val) => handleChange('year', parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bill Type Selection */}
          <div className="space-y-3">
            <Label>Bill Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BILL_TYPES.map((type) => (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    value.type === type.value
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleChange('type', type.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{type.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                      <div className={`
                        w-4 h-4 rounded-full border-2 mt-1
                        ${value.type === type.value 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                        }
                      `} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add any additional notes or description for this billing period..."
              value={value.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary Card */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Billing Summary</span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Period:</span>{' '}
                  {MONTHS.find(m => m.value === value.month)?.label} {value.year}
                </p>
                <p>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  {BILL_TYPES.find(t => t.value === value.type)?.label}
                </p>
                {value.description && (
                  <p>
                    <span className="text-muted-foreground">Notes:</span>{' '}
                    {value.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
