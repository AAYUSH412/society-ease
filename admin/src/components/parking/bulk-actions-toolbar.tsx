"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  X,
  Send,
  FileText,
} from "lucide-react"

interface BulkActionsToolbarProps {
  selectedCount: number
  onBulkAction: (action: string, violationIds: string[]) => void
  onClearSelection: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  onBulkAction,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const bulkActions = [
    {
      key: "approve",
      label: "Approve & Resolve",
      description: "Mark selected violations as resolved",
      icon: CheckCircle,
      color: "text-green-600",
      variant: "default" as const,
    },
    {
      key: "dismiss",
      label: "Dismiss Violations",
      description: "Dismiss selected violations as invalid",
      icon: XCircle,
      color: "text-red-600",
      variant: "destructive" as const,
    },
    {
      key: "review",
      label: "Mark for Review",
      description: "Set status to under review",
      icon: Clock,
      color: "text-blue-600",
      variant: "secondary" as const,
    },
    {
      key: "fine",
      label: "Issue Fines",
      description: "Create fines for selected violations",
      icon: DollarSign,
      color: "text-purple-600",
      variant: "outline" as const,
    },
    {
      key: "export",
      label: "Export Selected",
      description: "Export violation details to Excel",
      icon: FileText,
      color: "text-gray-600",
      variant: "outline" as const,
    },
  ]

  const handleBulkAction = (actionKey: string) => {
    onBulkAction(actionKey, []) // IDs will be handled by parent component
  }

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="font-medium">
                {selectedCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Bulk Actions:</span>
              
              {/* Quick Action Buttons */}
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleBulkAction("approve")}
                  className="h-8"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction("dismiss")}
                  className="h-8"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkAction("review")}
                  className="h-8"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Review
                </Button>
              </div>
              
              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    More
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Additional Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {bulkActions.slice(3).map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem
                        key={action.key}
                        onClick={() => handleBulkAction(action.key)}
                        className="cursor-pointer"
                      >
                        <Icon className={`h-4 w-4 mr-2 ${action.color}`} />
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Delete Selected</div>
                      <div className="text-xs text-muted-foreground">
                        Permanently remove violations
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Action Summary */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Send className="h-3 w-3" />
              <span>Notifications will be sent</span>
            </div>
          </div>
        </div>
        
        {/* Action Confirmations */}
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="grid gap-2 md:grid-cols-3 text-xs">
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Approve: Marks as resolved</span>
            </div>
            <div className="flex items-center space-x-1 text-red-600">
              <XCircle className="h-3 w-3" />
              <span>Dismiss: Marks as invalid</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <Clock className="h-3 w-3" />
              <span>Review: Needs investigation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
