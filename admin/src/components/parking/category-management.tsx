"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SeverityIndicator } from "@/components/shared/severity-indicator"
import { ViolationTypeIcon } from "@/components/shared/violation-type-icon"
import * as categoryApi from "@/lib/api/parking/categories"
import { ViolationCategory } from "@/lib/api/parking/categories"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  DollarSign,
  Eye,
  EyeOff,
  Search,
} from "lucide-react"
import { toast } from "sonner"

interface CategoryFormData {
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  baseFineAmount: number
  isActive: boolean
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<ViolationCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ViolationCategory | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    severity: "medium",
    baseFineAmount: 0,
    isActive: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.getCategories()
      // Fix: Extract categories from the API response
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      // Fix: Map form data to API request format
      const createRequest = {
        name: formData.name,
        description: formData.description,
        baseFineAmount: formData.baseFineAmount,
        severity: formData.severity,
        isActive: formData.isActive,
      }
      await categoryApi.createCategory(createRequest)
      toast.success('Category created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      loadCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return

    try {
      const updateRequest = {
        name: formData.name,
        description: formData.description,
        baseFineAmount: formData.baseFineAmount,
        severity: formData.severity,
        isActive: formData.isActive,
      }
      await categoryApi.updateCategory(selectedCategory._id, updateRequest)
      toast.success('Category updated successfully')
      setIsEditDialogOpen(false)
      resetForm()
      setSelectedCategory(null)
      loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await categoryApi.deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
    try {
      await categoryApi.updateCategory(categoryId, { isActive })
      toast.success(`Category ${isActive ? 'activated' : 'deactivated'} successfully`)
      loadCategories()
    } catch (error) {
      console.error('Error updating category status:', error)
      toast.error('Failed to update category status')
    }
  }

  const openEditDialog = (category: ViolationCategory) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      severity: category.severity,
      baseFineAmount: category.baseFineAmount,
      isActive: category.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      severity: "medium",
      baseFineAmount: 0,
      isActive: true,
    })
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = severityFilter === "all" || category.severity === severityFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && category.isActive) ||
                         (statusFilter === "inactive" && !category.isActive)
    
    return matchesSearch && matchesSeverity && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category Management</h2>
          <p className="text-muted-foreground">
            Manage parking violation categories and their settings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new parking violation category with its settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Unauthorized Parking"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the violation category..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                      setFormData(prev => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fine">Default Fine Amount</Label>
                  <Input
                    id="fine"
                    type="number"
                    value={formData.baseFineAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseFineAmount: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Active Category</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Severity</TableHead>
                <TableHead className="w-[120px]">Fine Amount</TableHead>
                <TableHead className="w-[100px]">Violations</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading categories...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                      <span className="text-muted-foreground">No categories found</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <ViolationTypeIcon type={category.name.toLowerCase()} />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created {new Date(category.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="text-sm line-clamp-2">{category.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SeverityIndicator severity={category.severity} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{category.baseFineAmount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category.totalViolations || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={(checked) => handleToggleStatus(category._id, checked)}
                        />
                        {category.isActive ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category settings and information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Unauthorized Parking"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the violation category..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-severity">Severity Level</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                    setFormData(prev => ({ ...prev, severity: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-fine">Default Fine Amount</Label>
                <Input
                  id="edit-fine"
                  type="number"
                  value={formData.baseFineAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseFineAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-active">Active Category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}