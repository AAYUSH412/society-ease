"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CategoryFormData {
  name: string
  description: string
  baseFineAmount: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  isActive: boolean
}

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CategoryFormData) => void
  initialData?: Partial<CategoryFormData>
  mode: 'create' | 'edit'
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    baseFineAmount: initialData?.baseFineAmount || 0,
    severity: initialData?.severity || 'medium',
    tags: initialData?.tags || [],
    isActive: initialData?.isActive ?? true
  })
  
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Category' : 'Edit Category'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new parking violation category with fine details.'
              : 'Update the parking violation category details.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Illegal Parking"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseFineAmount">Base Fine Amount</Label>
              <Input
                id="baseFineAmount"
                type="number"
                value={formData.baseFineAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, baseFineAmount: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the violation category..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={formData.severity} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
              setFormData(prev => ({ ...prev, severity: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    size={12} 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Category' : 'Update Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
