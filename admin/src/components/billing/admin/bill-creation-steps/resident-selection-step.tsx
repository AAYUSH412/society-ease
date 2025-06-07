"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  Search, 
  Building, 
  Mail, 
  Phone, 
  CheckSquare,
  UserCheck,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { getAdminResidents, type Resident } from "@/lib/api/billing"

interface SelectedResident {
  id: string
  flatNumber: string
  building?: string
  ownerName: string
  email: string
  phone: string
  isSelected: boolean
}

interface ResidentSelectionStepProps {
  residents: SelectedResident[]
  onChange: (residents: SelectedResident[]) => void
}

// Transform API resident data to component format
const transformResidentData = (resident: Resident): SelectedResident => ({
  id: resident._id,
  flatNumber: resident.flatNumber,
  building: resident.building,
  ownerName: resident.fullName,
  email: resident.email,
  phone: resident.phone,
  isSelected: false
})

export function ResidentSelectionStep({ residents, onChange }: ResidentSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBuilding, setSelectedBuilding] = useState<string>("")
  const [localResidents, setLocalResidents] = useState<SelectedResident[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch residents data from API
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getAdminResidents({
        limit: 100 // Get all residents
      })
      
      if (response.success && response.data) {
        const transformedResidents = response.data.residents.map(transformResidentData)
        setLocalResidents(transformedResidents)
        
        // If no residents were passed as props, update with API data
        if (residents.length === 0) {
          onChange(transformedResidents)
        }
      }
    } catch (err) {
      console.error('Error fetching residents:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch residents')
    } finally {
      setLoading(false)
    }
  }, [residents.length, onChange])

  // Initialize residents data
  useEffect(() => {
    if (residents.length === 0) {
      fetchResidents()
    } else {
      setLocalResidents(residents)
    }
  }, [residents, fetchResidents])

  // Get unique buildings
  const buildings = Array.from(new Set(localResidents.map(r => r.building).filter((building): building is string => Boolean(building))))

  // Filter residents based on search and building
  const filteredResidents = localResidents.filter(resident => {
    const matchesSearch = !searchTerm || 
      resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBuilding = !selectedBuilding || resident.building === selectedBuilding
    
    return matchesSearch && matchesBuilding
  })

  const selectedCount = localResidents.filter(r => r.isSelected).length
  const totalCount = localResidents.length

  const handleSelectAll = (checked: boolean) => {
    const updatedResidents = localResidents.map(resident => ({
      ...resident,
      isSelected: checked
    }))
    setLocalResidents(updatedResidents)
    onChange(updatedResidents)
  }

  const handleSelectResident = (residentId: string, checked: boolean) => {
    const updatedResidents = localResidents.map(resident =>
      resident.id === residentId 
        ? { ...resident, isSelected: checked }
        : resident
    )
    setLocalResidents(updatedResidents)
    onChange(updatedResidents)
  }

  const handleBuildingSelect = (building: string, checked: boolean) => {
    const updatedResidents = localResidents.map(resident =>
      resident.building === building 
        ? { ...resident, isSelected: checked }
        : resident
    )
    setLocalResidents(updatedResidents)
    onChange(updatedResidents)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Residents/Flats
          </CardTitle>
          <CardDescription>
            Choose which residents should receive bills for this billing period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading residents...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error loading residents</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchResidents}
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Main Content - Only show when not loading and no error */}
          {!loading && !error && (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by flat number, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                <option value="">All Buildings</option>
                {buildings.map(building => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedCount === totalCount}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="font-medium">
                      Select All ({totalCount})
                    </Label>
                  </div>
                  <Badge variant="secondary">
                    {selectedCount} of {totalCount} selected
                  </Badge>
                </div>

                {/* Building Quick Select */}
                <div className="flex gap-2">
                  {buildings.map(building => {
                    const buildingResidents = localResidents.filter(r => r.building === building)
                    const selectedInBuilding = buildingResidents.filter(r => r.isSelected).length
                    const allSelected = selectedInBuilding === buildingResidents.length && buildingResidents.length > 0
                    
                    return (
                      <Button
                        key={building}
                        variant={allSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBuildingSelect(building, !allSelected)}
                      >
                        <Building className="h-3 w-3 mr-1" />
                        {building}
                        {allSelected && <CheckSquare className="h-3 w-3 ml-1" />}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Residents List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Residents ({filteredResidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-4">
                  {filteredResidents.map((resident) => (
                    <Card 
                      key={resident.id} 
                      className={`cursor-pointer transition-all ${
                        resident.isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-sm'
                      }`}
                      onClick={() => handleSelectResident(resident.id, !resident.isSelected)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={resident.isSelected}
                              onCheckedChange={(checked) => 
                                handleSelectResident(resident.id, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {resident.flatNumber}
                                </Badge>
                                {resident.building && (
                                  <Badge variant="secondary">
                                    <Building className="h-3 w-3 mr-1" />
                                    {resident.building}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium">{resident.ownerName}</h4>
                              <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {resident.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {resident.phone}
                                </div>
                              </div>
                            </div>
                          </div>
                          {resident.isSelected && (
                            <Badge className="bg-primary">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {selectedCount} resident{selectedCount !== 1 ? 's' : ''} selected for billing
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Bills will be generated for the selected residents
                </p>
              </CardContent>
            </Card>
          )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
