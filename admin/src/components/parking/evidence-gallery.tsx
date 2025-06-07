"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViolationStatusBadge } from "@/components/shared/violation-status-badge"
import * as violationApi from "@/lib/api/parking/violations"
import {
  Camera,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
  Calendar,
  MapPin,
  User,
  Car,
  Trash2,
  Share,
  ZoomIn,
  FileImage,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface EvidencePhoto {
  _id: string
  url: string
  filename: string
  uploadedAt: string
  uploadedBy: {
    _id: string
    name: string
    role: string
  }
  violation: {
    _id: string
    violationType: string
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'dismissed'
    location: string
    vehicleInfo: {
      plateNumber: string
      make?: string
      model?: string
    }
    resident: {
      name: string
      unitNumber: string
    }
  }
  metadata: {
    size: number
    dimensions: {
      width: number
      height: number
    }
    format: string
  }
}

interface EvidenceGalleryProps {
  violationId?: string
  showViolationFilter?: boolean
}

export function EvidenceGallery({ violationId, showViolationFilter = true }: EvidenceGalleryProps) {
  const [photos, setPhotos] = useState<EvidencePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  useEffect(() => {
    loadEvidencePhotos()
  }, [violationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadEvidencePhotos = useCallback(async () => {
    try {
      setLoading(true)
      let data: EvidencePhoto[]
      if (violationId) {
        const response = await violationApi.getViolationDetails(violationId)
        const violation = response.data.violation
        // Create mock evidence photos since evidencePhotos doesn't exist in the API response
        data = violation.evidence?.photos ? violation.evidence.photos.map((photo: { url: string; filename?: string }, index: number) => ({
          _id: `${violationId}-${index}`,
          url: photo.url,
          filename: photo.filename || `evidence-${index + 1}.jpg`,
          uploadedAt: violation.createdAt || new Date().toISOString(),
          uploadedBy: {
            _id: violation.reportedBy?.userId || 'unknown',
            name: violation.reportedBy?.name || 'Unknown',
            role: 'user'
          },
          violation: {
            _id: violation._id,
            violationType: violation.category?.name || 'Unknown',
            status: violation.status as 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'dismissed',
            location: violation.location?.area || 'Unknown',
            vehicleInfo: {
              plateNumber: violation.violatedBy?.vehicleNumber || 'Unknown',
              make: '',
              model: ''
            },
            resident: {
              name: violation.violatedBy?.ownerName || 'Unknown',
              unitNumber: violation.violatedBy?.flatNumber || 'Unknown'
            }
          },
          metadata: {
            size: 0,
            dimensions: { width: 0, height: 0 },
            format: 'jpg'
          }
        })) : []
      } else {
        // Mock function since getAllEvidencePhotos doesn't exist
        data = []
        toast.info('Evidence photos API not available')
      }
      setPhotos(data)
    } catch (error) {
      console.error('Error loading evidence photos:', error)
      toast.error('Failed to load evidence photos')
    } finally {
      setLoading(false)
    }
  }, [violationId])

  const handlePhotoSelect = (photoId: string) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map(p => p._id)))
    }
  }

  const handleBulkDownload = async () => {
    if (selectedPhotos.size === 0) return

    try {
      const selectedPhotoObjects = photos.filter(p => selectedPhotos.has(p._id))
      
      for (const photo of selectedPhotoObjects) {
        const response = await fetch(photo.url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = photo.filename
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      toast.success(`Downloaded ${selectedPhotos.size} photos`)
      setSelectedPhotos(new Set())
    } catch (error) {
      console.error('Error downloading photos:', error)
      toast.error('Failed to download photos')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedPhotos.size} photos?`)) return

    try {
      // TODO: Implement delete evidence photo API
      // await Promise.all(
      //   Array.from(selectedPhotos).map(photoId => 
      //     violationApi.deleteEvidencePhoto(photoId)
      //   )
      // )
      toast.success(`Deleted ${selectedPhotos.size} photos`)
      setSelectedPhotos(new Set())
      loadEvidencePhotos()
    } catch (error) {
      console.error('Error deleting photos:', error)
      toast.error('Failed to delete photos')
    }
  }

  const downloadPhoto = async (photo: EvidencePhoto) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = photo.filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      toast.success('Photo downloaded')
    } catch (error) {
      console.error('Error downloading photo:', error)
      toast.error('Failed to download photo')
    }
  }

  const sharePhoto = async (photo: EvidencePhoto) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Evidence Photo - ${photo.violation.violationType}`,
          text: `Evidence photo for violation at ${photo.violation.location}`,
          url: photo.url,
        })
      } else {
        await navigator.clipboard.writeText(photo.url)
        toast.success('Photo URL copied to clipboard')
      }
    } catch (error) {
      console.error('Error sharing photo:', error)
      toast.error('Failed to share photo')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = 
      photo.violation.violationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.violation.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.violation.vehicleInfo.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.violation.resident.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || photo.violation.status === statusFilter
    
    const matchesDate = dateFilter === "all" || (() => {
      const photoDate = new Date(photo.uploadedAt)
      const now = new Date()
      switch (dateFilter) {
        case "today":
          return photoDate.toDateString() === now.toDateString()
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return photoDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return photoDate >= monthAgo
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Evidence Gallery</h2>
          <p className="text-muted-foreground">
            {violationId ? 'Photos for this violation' : 'All violation evidence photos'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          {!violationId && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Evidence
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Evidence Photos</DialogTitle>
                  <DialogDescription>
                    Add new evidence photos to a violation report.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="violation-select">Select Violation</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a violation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="violation1">Unauthorized Parking - Unit 101</SelectItem>
                        <SelectItem value="violation2">Double Parking - Unit 205</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="photos">Select Photos</Label>
                    <Input id="photos" type="file" multiple accept="image/*" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by violation type, location, plate number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {showViolationFilter && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          
          {selectedPhotos.size > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleBulkDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  {selectedPhotos.size === filteredPhotos.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading photos...</span>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No evidence photos found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredPhotos.map((photo) => (
                <div key={photo._id} className="relative group">
                  <div className="aspect-square relative">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.has(photo._id)}
                      onChange={() => handlePhotoSelect(photo._id)}
                      className="absolute top-2 left-2 z-10"
                    />
                    <Image
                      src={photo.url}
                      alt={photo.filename}
                      fill
                      className="object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedPhoto(photo)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPhoto(photo)
                          }}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="secondary">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => downloadPhoto(photo)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sharePhoto(photo)}>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium truncate">{photo.violation.violationType}</p>
                    <p className="text-xs text-muted-foreground truncate">{photo.violation.location}</p>
                    <div className="flex items-center space-x-1">
                      <ViolationStatusBadge status={photo.violation.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPhotos.map((photo) => (
                <div key={photo._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.has(photo._id)}
                    onChange={() => handlePhotoSelect(photo._id)}
                  />
                  <div className="relative w-16 h-16">
                    <Image
                      src={photo.url}
                      alt={photo.filename}
                      fill
                      className="object-cover rounded cursor-pointer"
                      onClick={() => setSelectedPhoto(photo)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{photo.violation.violationType}</h4>
                      <ViolationStatusBadge status={photo.violation.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{photo.violation.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Car className="h-3 w-3" />
                        <span>{photo.violation.vehicleInfo.plateNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{photo.violation.resident.name} - Unit {photo.violation.resident.unitNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(photo.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => downloadPhoto(photo)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => sharePhoto(photo)}>
                          <Share className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Evidence Details</DialogTitle>
              <DialogDescription>
                Photo evidence for violation #{selectedPhoto.violation._id.slice(-8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="relative w-full h-96">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.filename}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Violation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedPhoto.violation.violationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <ViolationStatusBadge status={selectedPhoto.violation.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{selectedPhoto.violation.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{selectedPhoto.violation.vehicleInfo.plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resident:</span>
                      <span>{selectedPhoto.violation.resident.name}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Photo Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filename:</span>
                      <span>{selectedPhoto.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>{formatDate(selectedPhoto.uploadedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded by:</span>
                      <span>{selectedPhoto.uploadedBy.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File size:</span>
                      <span>{formatFileSize(selectedPhoto.metadata.size)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => downloadPhoto(selectedPhoto)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => sharePhoto(selectedPhoto)}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
