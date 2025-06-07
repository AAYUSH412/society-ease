"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { CategoryFormDialog } from "@/components/parking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, Search, Settings, BarChart3, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { 
  getCategories as getViolationCategories, 
  createCategory as createViolationCategory, 
  updateCategory as updateViolationCategory, 
  deleteCategory as deleteViolationCategory,
  ViolationCategory,
  CategoryStats,
  CreateCategoryRequest
} from "@/lib/api/parking/categories"
import { toast } from "sonner"

interface CategoryFormData {
  name: string
  description: string
  baseFineAmount: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  isActive: boolean
}

export default function CategoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State management
  const [categories, setCategories] = useState<ViolationCategory[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ViolationCategory | null>(null)

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getViolationCategories()
      
      if (response.success && response.data) {
        setCategories(response.data.categories || [])
        setStats(response.data.stats || null)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Failed to load violation categories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Filter categories based on search and tab
  const getFilteredCategories = () => {
    let filtered = categories

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tab
    switch (activeTab) {
      case "active":
        filtered = filtered.filter(category => category.isActive)
        break
      case "inactive":
        filtered = filtered.filter(category => !category.isActive)
        break
      case "high_volume":
        filtered = filtered.filter(category => category.totalViolations > 10)
        break
      case "low_volume":
        filtered = filtered.filter(category => category.totalViolations <= 10)
        break
      default:
        break
    }

    return filtered
  }

  // Handle create category
  const handleCreateCategory = async (categoryData: CategoryFormData) => {
    try {
      const createRequest: CreateCategoryRequest = {
        name: categoryData.name,
        description: categoryData.description,
        baseFineAmount: categoryData.baseFineAmount,
        severity: categoryData.severity
      }
      const response = await createViolationCategory(createRequest)
      
      if (response.success) {
        toast.success("Category created successfully")
        setShowCreateDialog(false)
        loadCategories()
      } else {
        toast.error(response.message || "Failed to create category")
      }
    } catch (error) {
      console.error("Create category error:", error)
      toast.error("Failed to create category")
    }
  }

  // Handle update category
  const handleUpdateCategory = async (categoryId: string, categoryData: CategoryFormData) => {
    try {
      const updateRequest = {
        name: categoryData.name,
        description: categoryData.description,
        baseFineAmount: categoryData.baseFineAmount,
        severity: categoryData.severity,
        isActive: categoryData.isActive
      }
      const response = await updateViolationCategory(categoryId, updateRequest)
      
      if (response.success) {
        toast.success("Category updated successfully")
        setEditingCategory(null)
        loadCategories()
      } else {
        toast.error(response.message || "Failed to update category")
      }
    } catch (error) {
      console.error("Update category error:", error)
      toast.error("Failed to update category")
    }
  }

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await deleteViolationCategory(categoryId)
      
      if (response.success) {
        toast.success("Category deleted successfully")
        loadCategories()
      } else {
        toast.error(response.message || "Failed to delete category")
      }
    } catch (error) {
      console.error("Delete category error:", error)
      toast.error("Failed to delete category")
    }
  }

  // Handle toggle active status
  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await updateViolationCategory(categoryId, { isActive })
      
      if (response.success) {
        toast.success(`Category ${isActive ? 'activated' : 'deactivated'} successfully`)
        loadCategories()
      } else {
        toast.error(response.message || "Failed to update category status")
      }
    } catch (error) {
      console.error("Toggle active error:", error)
      toast.error("Failed to update category status")
    }
  }

  const filteredCategories = getFilteredCategories()

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Loading Categories..." description="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole="admin"
      userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
      userEmail={user?.email || ""}
      notifications={0}
    >
      <DashboardContent
        title="Violation Categories"
        description="Manage parking violation categories and their settings"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/parking")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                      <p className="text-2xl font-bold">{stats.totalCategories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                      <p className="text-2xl font-bold">{stats.activeCategories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">$</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Average Fine</p>
                      <p className="text-2xl font-bold">${stats.averageFineAmount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">#</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Violations</p>
                      <p className="text-2xl font-bold">{stats.totalViolations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {filteredCategories.length} Categories
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    All
                    <Badge variant="secondary" className="ml-2">
                      {categories.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active
                    <Badge variant="default" className="ml-2">
                      {categories.filter(c => c.isActive).length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="inactive">
                    Inactive
                    <Badge variant="secondary" className="ml-2">
                      {categories.filter(c => !c.isActive).length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="high_volume">
                    High Volume
                    <Badge variant="default" className="ml-2">
                      {categories.filter(c => c.totalViolations > 10).length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="low_volume">
                    Low Volume
                    <Badge variant="secondary" className="ml-2">
                      {categories.filter(c => c.totalViolations <= 10).length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Categories Content */}
                  <TabsContent value={activeTab} className="mt-0">
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">Loading categories...</div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No categories found
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <Card key={category._id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{category.name}</h3>
                                  <Badge
                                    variant={
                                      category.severity === 'critical' ? 'destructive' :
                                      category.severity === 'high' ? 'default' :
                                      category.severity === 'medium' ? 'secondary' : 'outline'
                                    }
                                  >
                                    {category.severity}
                                  </Badge>
                                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {category.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span>Fine: ${category.baseFineAmount}</span>
                                  <span>Violations: {category.totalViolations}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleActive(category._id, !category.isActive)}
                                >
                                  {category.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Create Dialog */}
        <CategoryFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateCategory}
          mode="create"
        />

        {/* Edit Dialog */}
        <CategoryFormDialog
          open={!!editingCategory}
          onOpenChange={(open: boolean) => !open && setEditingCategory(null)}
          onSubmit={(data: CategoryFormData) => editingCategory && handleUpdateCategory(editingCategory._id, data)}
          initialData={editingCategory ? {
            name: editingCategory.name,
            description: editingCategory.description,
            baseFineAmount: editingCategory.baseFineAmount,
            severity: editingCategory.severity,
            tags: [],
            isActive: editingCategory.isActive
          } : undefined}
          mode="edit"
        />
      </DashboardContent>
    </DashboardLayout>
  )
}
