"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Bell,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"

interface BillingSettings {
  defaultMaintenanceAmount: number
  defaultUtilityCharges: number
  lateFeePercentage: number
  lateFeeDays: number
  paymentDueDays: number
  autoGenerateBills: boolean
  sendPaymentReminders: boolean
  reminderDays: number[]
  taxRate: number
  currency: string
  billNumberPrefix: string
  emailNotifications: boolean
  smsNotifications: boolean
  allowPartialPayments: boolean
  gracePeriodDays: number
}

const defaultSettings: BillingSettings = {
  defaultMaintenanceAmount: 5500,
  defaultUtilityCharges: 1200,
  lateFeePercentage: 2,
  lateFeeDays: 15,
  paymentDueDays: 30,
  autoGenerateBills: true,
  sendPaymentReminders: true,
  reminderDays: [7, 3, 1],
  taxRate: 18,
  currency: "INR",
  billNumberPrefix: "SOC",
  emailNotifications: true,
  smsNotifications: false,
  allowPartialPayments: true,
  gracePeriodDays: 5
}

export function BillingSettings() {
  const [settings, setSettings] = useState<BillingSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Replace with actual API call
      // const response = await getAdminBillingSettings()
      // setSettings(response.data)
      
      // Simulate API call
      setTimeout(() => {
        setSettings(defaultSettings)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaveStatus('idle')
      
      // TODO: Replace with actual API call
      // await updateAdminBillingSettings(settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof BillingSettings>(
    key: K, 
    value: BillingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading settings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Settings</h3>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
              <Button onClick={fetchSettings} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Configure billing preferences and default values for the society
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === 'success' && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
              {saveStatus === 'error' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Default Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Default Charges
          </CardTitle>
          <CardDescription>
            Set default amounts for various billing categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maintenance">Maintenance Amount (₹)</Label>
              <Input
                id="maintenance"
                type="number"
                value={settings.defaultMaintenanceAmount}
                onChange={(e) => updateSetting('defaultMaintenanceAmount', Number(e.target.value))}
                placeholder="5500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utility">Utility Charges (₹)</Label>
              <Input
                id="utility"
                type="number"
                value={settings.defaultUtilityCharges}
                onChange={(e) => updateSetting('defaultUtilityCharges', Number(e.target.value))}
                placeholder="1200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parking">Parking Fee (₹)</Label>
              <Input
                id="parking"
                type="number"
                value={settings.defaultParkingFee}
                onChange={(e) => updateSetting('defaultParkingFee', Number(e.target.value))}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Input
                id="tax"
                type="number"
                value={settings.taxRate}
                onChange={(e) => updateSetting('taxRate', Number(e.target.value))}
                placeholder="18"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Due Date Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment & Due Date Settings
          </CardTitle>
          <CardDescription>
            Configure payment terms and late fee policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dueDays">Payment Due Days</Label>
              <Input
                id="dueDays"
                type="number"
                value={settings.paymentDueDays}
                onChange={(e) => updateSetting('paymentDueDays', Number(e.target.value))}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">
                Number of days from bill generation to due date
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gracePeriod">Grace Period Days</Label>
              <Input
                id="gracePeriod"
                type="number"
                value={settings.gracePeriodDays}
                onChange={(e) => updateSetting('gracePeriodDays', Number(e.target.value))}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                Grace period before late fees apply
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateFeePercent">Late Fee Percentage (%)</Label>
              <Input
                id="lateFeePercent"
                type="number"
                step="0.1"
                value={settings.lateFeePercentage}
                onChange={(e) => updateSetting('lateFeePercentage', Number(e.target.value))}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateFeeDays">Late Fee After Days</Label>
              <Input
                id="lateFeeDays"
                type="number"
                value={settings.lateFeeDays}
                onChange={(e) => updateSetting('lateFeeDays', Number(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bill Generation Settings
          </CardTitle>
          <CardDescription>
            Configure automatic bill generation and numbering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="billPrefix">Bill Number Prefix</Label>
              <Input
                id="billPrefix"
                value={settings.billNumberPrefix}
                onChange={(e) => updateSetting('billNumberPrefix', e.target.value)}
                placeholder="SOC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => updateSetting('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Generate Bills</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically generate monthly bills on the 1st of each month
                </p>
              </div>
              <Switch
                checked={settings.autoGenerateBills}
                onCheckedChange={(checked) => updateSetting('autoGenerateBills', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Partial Payments</Label>
                <p className="text-xs text-muted-foreground">
                  Allow residents to make partial payments towards their bills
                </p>
              </div>
              <Switch
                checked={settings.allowPartialPayments}
                onCheckedChange={(checked) => updateSetting('allowPartialPayments', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure payment reminders and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Send Payment Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically send payment reminders to residents
                </p>
              </div>
              <Switch
                checked={settings.sendPaymentReminders}
                onCheckedChange={(checked) => updateSetting('sendPaymentReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send notifications via SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>
          </div>

          {settings.sendPaymentReminders && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Reminder Schedule</Label>
                <p className="text-xs text-muted-foreground">
                  Days before due date to send reminders
                </p>
                <div className="flex gap-2">
                  {settings.reminderDays.map((day, index) => (
                    <Badge key={index} variant="secondary">
                      {day} day{day !== 1 ? 's' : ''} before
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
