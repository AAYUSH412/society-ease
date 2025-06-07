"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  FileImage
} from "lucide-react"

interface PhotoEvidence {
  photoId: string
  url: string
  thumbnailUrl?: string
  uploadedAt: string
  description?: string
  metadata?: {
    size?: number
    type?: string
    dimensions?: string
  }
}

interface PhotoViewerProps {
  photos: PhotoEvidence[]
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPhotoIndex?: number
}

export function PhotoViewer({ 
  photos, 
  open, 
  onOpenChange, 
  initialPhotoIndex = 0 
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  if (!photos.length) return null

  const currentPhoto = photos[currentIndex]

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
    resetTransforms()
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    resetTransforms()
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const rotate = () => setRotation(prev => (prev + 90) % 360)
  
  const resetTransforms = () => {
    setZoom(100)
    setRotation(0)
  }

  const downloadPhoto = async () => {
    try {
      const response = await fetch(currentPhoto.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `violation-evidence-${currentPhoto.photoId}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download photo:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <FileImage className="h-5 w-5" />
              <div>
                <DialogTitle>Evidence Photo {currentIndex + 1} of {photos.length}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Uploaded {formatDate(currentPhoto.uploadedAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(currentPhoto.uploadedAt)}
              </Badge>
              
              {currentPhoto.metadata?.size && (
                <Badge variant="outline">
                  {formatFileSize(currentPhoto.metadata.size)}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Photo and Controls */}
          <div className="flex-1 flex">
            {/* Main Photo Area */}
            <div className="flex-1 relative bg-muted/50 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="relative transition-transform duration-200 ease-in-out"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  }}
                >
                  <Image
                    src={currentPhoto.url}
                    alt={`Evidence photo ${currentIndex + 1}`}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                </div>
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomOut}
                  disabled={zoom <= 50}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-mono min-w-[3rem] text-center">
                  {zoom}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomIn}
                  disabled={zoom >= 200}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-4 bg-white/30 mx-1" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={rotate}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadPhoto}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar with Thumbnails */}
            {photos.length > 1 && (
              <div className="w-48 border-l bg-background/50">
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">All Photos</h4>
                </div>
                <ScrollArea className="h-[calc(100%-3rem)]">
                  <div className="p-3 space-y-2">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.photoId}
                        onClick={() => {
                          setCurrentIndex(index)
                          resetTransforms()
                        }}
                        className={cn(
                          "w-full relative rounded-lg overflow-hidden border-2 transition-colors",
                          index === currentIndex 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Image
                          src={photo.thumbnailUrl || photo.url}
                          alt={`Thumbnail ${index + 1}`}
                          width={160}
                          height={120}
                          className="w-full h-24 object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-1 right-1">
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Description */}
          {currentPhoto.description && (
            <div className="p-4 border-t bg-muted/30">
              <h4 className="font-medium text-sm mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {currentPhoto.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
