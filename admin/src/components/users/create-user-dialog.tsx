"use client"

import { useState } from "react"
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

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateUser: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber: string
    flatNumber: string
    role: string
  }) => Promise<void>
  loading?: boolean
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onCreateUser,
  loading = false
}: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    flatNumber: "",
    building: "",
    societyName: "",
    password: "",
    confirmPassword: "",
    role: "resident"
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone is required"
    if (!formData.flatNumber.trim()) newErrors.flatNumber = "Flat number is required"
    if (!formData.societyName.trim()) newErrors.societyName = "Society name is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = "Phone number must be 10 digits"
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = formData
      await onCreateUser(userData)
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        flatNumber: "",
        building: "",
        societyName: "",
        password: "",
        confirmPassword: ""
      })
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      flatNumber: "",
      building: "",
      societyName: "",
      password: "",
      confirmPassword: ""
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new resident to the system. They will be able to login immediately.
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
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber}</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm password"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
