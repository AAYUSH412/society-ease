'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Alert, CreateAlertRequest, createAlert, updateAlert } from '@/lib/api/alerts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Clock, 
  Plus, 
  X,
  Info,
  Settings,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

const alertFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['water', 'electricity', 'gas', 'general', 'maintenance', 'security', 'internet']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedResolutionTime: z.string().min(1, 'Estimated resolution time is required'),
  scheduledTime: z.string().optional(),
  visibility: z.object({
    scope: z.enum(['all', 'specific_buildings', 'specific_flats', 'specific_areas']),
    buildings: z.array(z.string()).optional(),
    flats: z.array(z.object({
      flatNumber: z.string(),
      building: z.string()
    })).optional(),
    areas: z.array(z.string()).optional()
  }),
  tags: z.array(z.string()).optional(),
  autoClose: z.object({
    enabled: z.boolean(),
    afterHours: z.number().min(1).max(168).optional()
  }).optional()
})

type AlertFormData = z.infer<typeof alertFormSchema>

interface AlertFormProps {
  alert?: Alert
  onSuccess?: (alert: Alert) => void
  onCancel?: () => void
  isEdit?: boolean
}

export const AlertForm: React.FC<AlertFormProps> = ({
  alert,
  onSuccess,
  onCancel,
  isEdit = false
}) => {
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [buildings] = useState<Array<{ id: string; name: string }>>([
    { id: 'A', name: 'Building A' },
    { id: 'B', name: 'Building B' },
    { id: 'C', name: 'Building C' }
  ])

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      title: alert?.title || '',
      description: alert?.description || '',
      type: alert?.type || 'general',
      priority: alert?.priority || 'medium',
      estimatedResolutionTime: alert?.estimatedResolutionTime ? 
        new Date(alert.estimatedResolutionTime).toISOString().slice(0, 16) : '',
      scheduledTime: alert?.scheduledTime ? 
        new Date(alert.scheduledTime).toISOString().slice(0, 16) : '',
      visibility: {
        scope: alert?.visibility?.scope || 'all',
        buildings: alert?.visibility?.affectedAreas?.buildings || [],
        flats: alert?.visibility?.affectedAreas?.flats || [],
        areas: alert?.visibility?.affectedAreas?.areas || []
      },
      tags: alert?.tags || [],
      autoClose: alert?.autoClose || { enabled: false }
    }
  })

  const watchVisibilityScope = form.watch('visibility.scope')
  const watchTags = form.watch('tags')
  const watchAutoClose = form.watch('autoClose')

  const onSubmit = async (data: AlertFormData) => {
    try {
      setLoading(true)
      
      const alertData: CreateAlertRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        estimatedResolutionTime: data.estimatedResolutionTime,
        scheduledTime: data.scheduledTime || undefined,
        visibility: {
          scope: data.visibility.scope,
          affectedAreas: {
            buildings: data.visibility.buildings,
            flats: data.visibility.flats,
            areas: data.visibility.areas
          }
        },
        tags: data.tags,
        autoClose: data.autoClose
      }

      let response
      if (isEdit && alert?._id) {
        response = await updateAlert(alert._id, alertData)
      } else {
        response = await createAlert(alertData)
      }

      if (response.success && response.data) {
        toast.success(isEdit ? 'Alert updated successfully' : 'Alert created successfully')
        onSuccess?.(response.data)
      }
    } catch (error) {
      console.error('Error saving alert:', error)
      toast.error(isEdit ? 'Failed to update alert' : 'Failed to create alert')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !watchTags?.includes(newTag.trim())) {
      const currentTags = watchTags || []
      form.setValue('tags', [...currentTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = watchTags || []
    form.setValue('tags', currentTags.filter((tag: string) => tag !== tagToRemove))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="h-4 w-4 text-blue-500" />
      case 'electricity':
        return <Zap className="h-4 w-4 text-yellow-500" />
      case 'gas':
        return <Flame className="h-4 w-4 text-orange-500" />
      case 'maintenance':
        return <Settings className="h-4 w-4 text-purple-500" />
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'internet':
        return <Wifi className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alert title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the alert details" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="water">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('water')}
                              Water
                            </div>
                          </SelectItem>
                          <SelectItem value="electricity">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('electricity')}
                              Electricity
                            </div>
                          </SelectItem>
                          <SelectItem value="gas">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('gas')}
                              Gas
                            </div>
                          </SelectItem>
                          <SelectItem value="maintenance">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('maintenance')}
                              Maintenance
                            </div>
                          </SelectItem>
                          <SelectItem value="security">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('security')}
                              Security
                            </div>
                          </SelectItem>
                          <SelectItem value="internet">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('internet')}
                              Internet
                            </div>
                          </SelectItem>
                          <SelectItem value="general">
                            <div className="flex items-center gap-2">
                              {getTypeIcon('general')}
                              General
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">
                            <Badge className={getPriorityColor('critical')}>Critical</Badge>
                          </SelectItem>
                          <SelectItem value="high">
                            <Badge className={getPriorityColor('high')}>High</Badge>
                          </SelectItem>
                          <SelectItem value="medium">
                            <Badge className={getPriorityColor('medium')}>Medium</Badge>
                          </SelectItem>
                          <SelectItem value="low">
                            <Badge className={getPriorityColor('low')}>Low</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedResolutionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Resolution Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      When do you expect this issue to be resolved?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Time (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      For scheduled maintenance or future alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="visibility.scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Residents</SelectItem>
                        <SelectItem value="specific_buildings">Specific Buildings</SelectItem>
                        <SelectItem value="specific_flats">Specific Flats</SelectItem>
                        <SelectItem value="specific_areas">Specific Areas</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchVisibilityScope === 'specific_buildings' && (
              <FormField
                control={form.control}
                name="visibility.buildings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Buildings</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value?.[0] || ''} 
                        onValueChange={(value) => field.onChange([value])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select buildings" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchVisibilityScope === 'specific_areas' && (
              <FormField
                control={form.control}
                name="visibility.areas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter areas separated by commas (e.g., Garden, Parking)"
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => {
                          const areas = e.target.value.split(',').map(f => f.trim()).filter(f => f)
                          field.onChange(areas)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {watchTags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 p-0 w-4"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto Close Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auto Close Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="autoClose.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Auto Close
                    </FormLabel>
                    <FormDescription>
                      Automatically close this alert after a specified time
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchAutoClose?.enabled && (
              <FormField
                control={form.control}
                name="autoClose.afterHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auto close after (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of hours after which the alert will be automatically closed (1-168 hours)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Alert' : 'Create Alert'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
