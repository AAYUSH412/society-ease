"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, DollarSign, Calendar, User } from "lucide-react"
import Link from "next/link"

interface RelatedFine {
  _id: string
  fineId: string
  residentId: string
  resident: {
    name: string
    flatNumber: string
    building?: string
  }
  violation: {
    category: string
    incidentDateTime: string
  }
  fineAmount: number
  totalAmount: number
  status: string
  paymentStatus: string
  issuedDate: string
  dueDate: string
}

interface RelatedFinesTableProps {
  residentId?: string
  violationCategory?: string
  excludeFineId?: string
  limit?: number
}

export function RelatedFinesTable({ 
  residentId, 
  violationCategory, 
  excludeFineId,
  limit = 10 
}: RelatedFinesTableProps) {
  const [fines, setFines] = useState<RelatedFine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('issuedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchRelatedFines()
  }, [residentId, violationCategory, excludeFineId, sortBy, sortOrder])

  const fetchRelatedFines = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockFines: RelatedFine[] = [
        {
          _id: '1',
          fineId: 'F-2024-001',
          residentId: residentId || 'resident1',
          resident: {
            name: 'John Doe',
            flatNumber: '101',
            building: 'A'
          },
          violation: {
            category: violationCategory || 'Illegal Parking',
            incidentDateTime: '2024-03-15T10:30:00Z'
          },
          fineAmount: 50.00,
          totalAmount: 50.00,
          status: 'pending',
          paymentStatus: 'unpaid',
          issuedDate: '2024-03-15T10:30:00Z',
          dueDate: '2024-03-30T23:59:59Z'
        },
        {
          _id: '2',
          fineId: 'F-2024-002',
          residentId: residentId || 'resident1',
          resident: {
            name: 'John Doe',
            flatNumber: '101',
            building: 'A'
          },
          violation: {
            category: 'Parking in No-Parking Zone',
            incidentDateTime: '2024-02-20T14:20:00Z'
          },
          fineAmount: 75.00,
          totalAmount: 75.00,
          status: 'paid',
          paymentStatus: 'paid',
          issuedDate: '2024-02-20T14:20:00Z',
          dueDate: '2024-03-06T23:59:59Z'
        }
      ].filter(fine => fine._id !== excludeFineId)

      setFines(mockFines.slice(0, limit))
    } catch (error) {
      console.error('Error fetching related fines:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'waived': return 'bg-gray-100 text-gray-800'
      case 'disputed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFines = fines.filter(fine => {
    const matchesSearch = fine.fineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fine.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fine.violation.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || fine.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedFines = [...filteredFines].sort((a, b) => {
    let aValue: any = a[sortBy as keyof RelatedFine]
    let bValue: any = b[sortBy as keyof RelatedFine]
    
    if (sortBy === 'totalAmount') {
      aValue = a.totalAmount
      bValue = b.totalAmount
    } else if (sortBy === 'issuedDate') {
      aValue = new Date(a.issuedDate).getTime()
      bValue = new Date(b.issuedDate).getTime()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Related Fines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading related fines...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Related Fines
        </CardTitle>
        <CardDescription>
          {residentId ? 'Other fines for this resident' : 
           violationCategory ? `Other fines in ${violationCategory} category` : 
           'Related fines'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedFines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No related fines found</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issuedDate-desc">Newest First</SelectItem>
                  <SelectItem value="issuedDate-asc">Oldest First</SelectItem>
                  <SelectItem value="totalAmount-desc">Highest Amount</SelectItem>
                  <SelectItem value="totalAmount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fine ID</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFines.map((fine) => (
                    <TableRow key={fine._id}>
                      <TableCell className="font-medium">
                        {fine.fineId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{fine.resident.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {fine.resident.building ? `${fine.resident.building}-` : ''}{fine.resident.flatNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={fine.violation.category}>
                          {fine.violation.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${fine.totalAmount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(fine.status)}>
                          {fine.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(fine.issuedDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/parking/fines/${fine._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {sortedFines.length} of {fines.length} related fines
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
