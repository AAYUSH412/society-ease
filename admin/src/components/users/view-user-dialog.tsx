"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { User } from "@/lib/api"
import { format } from "date-fns"
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Shield, 
  MapPin,
  User as UserIcon 
} from "lucide-react"

interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function ViewUserDialog({
  open,
  onOpenChange,
  user
}: ViewUserDialogProps) {
  if (!user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'rejected': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'resident': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with name and badges */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Member since {format(new Date(user.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getRoleColor(user.role)}>
                {user.role.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(user.status)}>
                {user.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.isEmailVerified ? "✓ Verified" : "⚠ Not verified"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">{user.phone}</div>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Property Information
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Flat {user.flatNumber}</div>
                  {user.building && (
                    <div className="text-sm text-muted-foreground">
                      Building: {user.building}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium">{user.societyName}</div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Account Information
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Role: {user.role.replace('_', ' ')}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: {user.status}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    Joined: {format(new Date(user.createdAt), 'PPP')}
                  </div>
                  {user.lastLogin && (
                    <div className="text-sm text-muted-foreground">
                      Last login: {format(new Date(user.lastLogin), 'PPp')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {user.address && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Address Details
              </h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm">
                  {user.address.street && <div>{user.address.street}</div>}
                  {user.address.city && <div>{user.address.city}</div>}
                  {user.address.state && <div>{user.address.state}</div>}
                  {user.address.pincode && <div>PIN: {user.address.pincode}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
