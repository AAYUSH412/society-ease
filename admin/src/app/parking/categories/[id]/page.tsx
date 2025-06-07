"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Trash2, BarChart3, Settings, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { 
  getCategoryById as getViolationCategoryById, 
  updateCategory as updateViolationCategory, 
  deleteCategory as deleteViolationCategory,
  ViolationCategory 
} from "@/lib/api/parking/categories"
import { getAllViolations } from "@/lib/api/parking/violations"
import { toast } from "sonner"

interface CategoryViolation {
  id: string
  violatorName: string
  violatorUnit: string
  vehicleNumber: string
  location: string
  reportedAt: string
  status: string
  fineAmount: number
  severity: string
}

export default function EditCategoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  
  // State management
  const [category, setCategory] = useState<ViolationCategory | null>(null)
  const [categoryViolations, setCategoryViolations] = useState<CategoryViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("settings")
  const [hasChanges, setHasChanges] = useState(false)

  // Load category details
  const loadCategoryDetails = useCallback(async () => {
    if (!categoryId) return
    
    try {
      setLoading(true)
      const [categoryResponse, violationsResponse] = await Promise.all([
        getViolationCategoryById(categoryId),
        getAllViolations({ category: categoryId })
      ])
      
      if (categoryResponse.success && categoryResponse.data) {
        setCategory(categoryResponse.data.category)
      } else {
        toast.error("Category not found")
        router.push("/parking/categories")
        return
      }

      if (violationsResponse.success && violationsResponse.data) {
        // Transform ParkingViolation[] to CategoryViolation[]
        const transformedViolations = violationsResponse.data.violations.map(v => ({
          id: v._id,
          violatorName: v.violatedBy.ownerName || 'Unknown',
          violatorUnit: v.violatedBy.flatNumber + (v.violatedBy.building ? ` - ${v.violatedBy.building}` : ''),
          vehicleNumber: v.violatedBy.vehicleNumber || 'Unknown',
          location: v.location.area,
          reportedAt: v.incidentDateTime,
          status: v.status,
          fineAmount: v.adminReview?.fineAmount || v.category.baseFineAmount,
          severity: v.category.severity
        }))
        setCategoryViolations(transformedViolations)
      }
    } catch (error) {
      console.error("Error loading category details:", error)
      toast.error("Failed to load category details")
      router.push("/parking/categories")
    } finally {
      setLoading(false)
    }
  }, [categoryId, router])

  useEffect(() => {
    loadCategoryDetails()
  }, [loadCategoryDetails])

  // Handle form changes (currently unused but kept for future functionality)
  // const handleCategoryChange = (updatedCategory: Partial<ViolationCategory>) => {
  //   if (category) {
  //     setCategory({ ...category, ...updatedCategory })
  //     setHasChanges(true)
  //   }
  // }

  // Handle save
  const handleSave = async () => {
    if (!category) return

    try {
      setSaving(true)
      const response = await updateViolationCategory(category._id, category)
      
      if (response.success) {
        toast.success("Category updated successfully")
        setHasChanges(false)
        loadCategoryDetails()
      } else {
        toast.error(response.message || "Failed to update category")
      }
    } catch (error) {
      console.error("Save category error:", error)
      toast.error("Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!category) return

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(true)
      const response = await deleteViolationCategory(category._id)
      
      if (response.success) {
        toast.success("Category deleted successfully")
        router.push("/parking/categories")
      } else {
        toast.error(response.message || "Failed to delete category")
      }
    } catch (error) {
      console.error("Delete category error:", error)
      toast.error("Failed to delete category")
    } finally {
      setDeleting(false)
    }
  }

  // Handle back navigation with unsaved changes check
  const handleBack = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push("/parking/categories")
      }
    } else {
      router.push("/parking/categories")
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Loading..." description="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    )
  }

  if (!category) {
    return (
      <DashboardLayout
        userRole="admin"
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Admin"}
        userEmail={user?.email || ""}
        notifications={0}
      >
        <DashboardContent title="Category Not Found" description="">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Category Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested category could not be found.</p>
            <Button onClick={() => router.push("/parking/categories")}>
              Back to Categories
            </Button>
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
        title={`Edit Category: ${category.name}`}
        description={category.description}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Category Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)` }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {category.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    ₹{category.baseFineAmount}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You have unsaved changes. Don&apos;t forget to save your modifications.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="violations">
                    Violations
                    <Badge variant="secondary" className="ml-2">
                      {categoryViolations.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="settings" className="mt-0">
                    <div className="p-6 text-center text-muted-foreground">
                      Category form coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0">
                    <div className="p-6 text-center text-muted-foreground">
                      Category analytics coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="violations" className="mt-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Related Violations ({categoryViolations.length})</h3>
                      {categoryViolations.length > 0 ? (
                        <div className="space-y-2">
                          {categoryViolations.slice(0, 5).map((violation) => (
                            <div key={violation.id} className="flex justify-between items-center p-2 border rounded">
                              <span>{violation.violatorName} - {violation.violatorUnit}</span>
                              <span className="text-sm text-muted-foreground">{violation.status}</span>
                            </div>
                          ))}
                          {categoryViolations.length > 5 && (
                            <p className="text-sm text-muted-foreground">
                              And {categoryViolations.length - 5} more violations...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No violations found for this category.</p>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {category.totalViolations}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Violations
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((category.totalViolations > 0 ? (category.totalViolations - categoryViolations.filter(v => v.status === 'pending').length) / category.totalViolations * 100 : 0))}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Resolution Rate
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{category.averageFinePerViolation || category.baseFineAmount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Fine
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {category.resolutionTimeLimit}h
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Resolution
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  )
}
