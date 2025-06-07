"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "@/lib/api"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onUpdateUser: (userId: string, userData: any) => Promise<void>
  onUpdateRole: (userId: string, role: string) => Promise<void>
  currentUser: User | null
  loading?: boolean
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onUpdateUser,
  onUpdateRole,
  currentUser,
  loading = false
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    flatNumber: "",
    building: "",
    societyName: "",
    role: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        flatNumber: user.flatNumber || "",
        building: user.building || "",
        societyName: user.societyName || "",
        role: user.role || ""
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.flatNumber.trim()) newErrors.flatNumber = "Flat number is required"
    if (!formData.societyName.trim()) newErrors.societyName = "Society name is required"

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const canEditRole = () => {
    if (!currentUser || !user) return false
    
    // Super admin can edit any role
    if (currentUser.role === 'super_admin') return true
    
    // Admin can't edit admin or super admin roles
    if (currentUser.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      return false
    }
    
    return currentUser.role === 'admin'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return

    try {
      const { role, ...userData } = formData
      
      // Update user data
      await onUpdateUser(user._id, userData)
      
      // Update role if changed and user has permission
      if (role !== user.role && canEditRole()) {
        await onUpdateRole(user._id, role)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleClose = () => {
    setErrors({})
    onOpenChange(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number *</Label>
              <Input
                id="flatNumber"
                value={formData.flatNumber}
                onChange={(e) => handleInputChange("flatNumber", e.target.value)}
                placeholder="e.g., A101"
                className={errors.flatNumber ? "border-red-500" : ""}
              />
              {errors.flatNumber && (
                <p className="text-sm text-red-500">{errors.flatNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="building">Building</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => handleInputChange("building", e.target.value)}
                placeholder="Building name (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="societyName">Society Name *</Label>
            <Input
              id="societyName"
              value={formData.societyName}
              onChange={(e) => handleInputChange("societyName", e.target.value)}
              placeholder="Enter society name"
              className={errors.societyName ? "border-red-500" : ""}
            />
            {errors.societyName && (
              <p className="text-sm text-red-500">{errors.societyName}</p>
            )}
          </div>

          {canEditRole() && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  {currentUser?.role === 'super_admin' && (
                    <>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
