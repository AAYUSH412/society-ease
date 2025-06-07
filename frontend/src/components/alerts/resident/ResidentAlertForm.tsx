'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, AlertCircle, Plus, X } from 'lucide-react'
import { CreateResidentAlertRequest, createResidentAlert } from '@/lib/api/resident-alerts'
import { ResidentAlertTypeIcon } from './ResidentAlertTypeIcon'

interface ResidentAlertFormProps {
  onSuccess?: (alertId: string) => void
  onCancel?: () => void
  initialData?: Partial<CreateResidentAlertRequest>
}

const ALERT_TYPES = [
  { value: 'water', label: 'Water Supply', description: 'Water outage, leakage, quality issues' },
  { value: 'electricity', label: 'Electricity', description: 'Power outage, electrical faults' },
  { value: 'gas', label: 'Gas Supply', description: 'Gas pipeline issues, leakage' },
  { value: 'maintenance', label: 'Maintenance', description: 'Building repairs, facility issues' },
  { value: 'security', label: 'Security', description: 'Security concerns, safety issues' },
  { value: 'internet', label: 'Internet/Cable', description: 'Internet, cable TV connectivity' },
  { value: 'general', label: 'General', description: 'Other community issues' }
] as const

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Minor issue, can wait' },
  { value: 'medium', label: 'Medium', description: 'Needs attention soon' },
  { value: 'high', label: 'High', description: 'Urgent attention required' }
] as const

export const ResidentAlertForm: React.FC<ResidentAlertFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateResidentAlertRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'general',
    priority: initialData?.priority || 'medium',
    estimatedResolutionTime: initialData?.estimatedResolutionTime || '',
    scheduledTime: initialData?.scheduledTime || '',
    visibility: initialData?.visibility || {
      scope: 'all',
      affectedAreas: {}
    },
    tags: initialData?.tags || [],
    autoClose: initialData?.autoClose || {
      enabled: false,
      afterHours: 24
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [estimatedDate, setEstimatedDate] = useState<Date>()
  const [scheduledDate, setScheduledDate] = useState<Date>()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.estimatedResolutionTime) {
      newErrors.estimatedResolutionTime = 'Expected resolution time is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const response = await createResidentAlert(formData)
      
      if (response.success && response.data) {
        onSuccess?.(response.data._id)
      } else {
        setErrors({ submit: response.message || 'Failed to create alert' })
      }
    } catch (err) {
      setErrors({ 
        submit: err instanceof Error ? err.message : 'An error occurred' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const updateDateTime = (date: Date | undefined, field: 'estimatedResolutionTime' | 'scheduledTime') => {
    if (date) {
      const isoString = date.toISOString()
      setFormData(prev => ({ ...prev, [field]: isoString }))
      
      if (field === 'estimatedResolutionTime') {
        setEstimatedDate(date)
      } else {
        setScheduledDate(date)
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Report New Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Alert Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Alert Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <ResidentAlertTypeIcon type={type.value} className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div>
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-xs text-muted-foreground">{priority.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about the issue, including location, time noticed, and any relevant details..."
              className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Expected Resolution Time */}
          <div className="space-y-2">
            <Label>Expected Resolution Time *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !estimatedDate && "text-muted-foreground"
                  } ${errors.estimatedResolutionTime ? 'border-red-500' : ''}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {estimatedDate ? format(estimatedDate, "PPP p") : "Select expected resolution time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={estimatedDate}
                  onSelect={(date) => updateDateTime(date, 'estimatedResolutionTime')}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.estimatedResolutionTime && (
              <p className="text-sm text-red-500">{errors.estimatedResolutionTime}</p>
            )}
          </div>

          {/* Scheduled Time (Optional) */}
          <div className="space-y-2">
            <Label>Scheduled Maintenance Time (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !scheduledDate && "text-muted-foreground"
                  }`}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP p") : "Select if this is scheduled maintenance"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={(date) => updateDateTime(date, 'scheduledTime')}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Auto Close */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoClose">Auto-close after resolution</Label>
              <Switch
                id="autoClose"
                checked={formData.autoClose?.enabled || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    autoClose: { ...prev.autoClose, enabled: checked }
                  }))
                }
              />
            </div>
            {formData.autoClose?.enabled && (
              <div className="ml-4">
                <Label htmlFor="autoCloseHours">Auto-close after (hours)</Label>
                <Input
                  id="autoCloseHours"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.autoClose.afterHours || 24}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      autoClose: { 
                        ...prev.autoClose,
                        afterHours: parseInt(e.target.value) || 24
                      }
                    }))
                  }
                />
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating Alert...' : 'Create Alert'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
