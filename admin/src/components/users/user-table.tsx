"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  UserMinus,
  Eye 
} from "lucide-react"
import { User } from "@/lib/api"
import { format } from "date-fns"

interface UserTableProps {
  users: User[]
  loading: boolean
  currentUser: User | null
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  onApproveUser: (userId: string) => void
  onRejectUser: (userId: string) => void
  onSuspendUser: (userId: string) => void
  onReactivateUser: (userId: string) => void
  onViewUser: (user: User) => void
}

export function UserTable({
  users,
  loading,
  currentUser,
  onEditUser,
  onDeleteUser,
  onApproveUser,
  onRejectUser,
  onSuspendUser,
  onReactivateUser,
  onViewUser
}: UserTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string }>({ 
    open: false, 
    userId: "" 
  })

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

  const canPerformAction = (targetUser: User, action: string) => {
    if (!currentUser) return false
    
    // Super admin can do everything
    if (currentUser.role === 'super_admin') return true
    
    // Admin can't modify super admins or other admins
    if (currentUser.role === 'admin') {
      if (targetUser.role === 'super_admin' || targetUser.role === 'admin') {
        return false
      }
      return true
    }
    
    return false
  }

  const handleDeleteUser = (userId: string) => {
    setDeleteDialog({ open: false, userId: "" })
    onDeleteUser(userId)
  }

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      Flat {user.flatNumber}
                    </div>
                    {user.building && (
                      <div className="text-xs text-muted-foreground">
                        {user.building}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {user.societyName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewUser(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      
                      {canPerformAction(user, 'edit') && (
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}

                      {user.status === 'pending' && canPerformAction(user, 'approve') && (
                        <>
                          <DropdownMenuItem onClick={() => onApproveUser(user._id)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRejectUser(user._id)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}

                      {user.status === 'approved' && canPerformAction(user, 'suspend') && (
                        <DropdownMenuItem onClick={() => onSuspendUser(user._id)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Suspend
                        </DropdownMenuItem>
                      )}

                      {user.status === 'suspended' && canPerformAction(user, 'reactivate') && (
                        <DropdownMenuItem onClick={() => onReactivateUser(user._id)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Reactivate
                        </DropdownMenuItem>
                      )}

                      {canPerformAction(user, 'delete') && user._id !== currentUser?._id && (
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialog({ open: true, userId: user._id })}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteUser(deleteDialog.userId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
