"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  FileText, 
  Loader2,
  RefreshCw,
  Download
} from "lucide-react"
import { generateBulkBills } from "@/lib/api/billing"

interface SelectedResident {
  id: string
  flatNumber: string
  residentName: string
  building?: string
}

interface BillingPeriod {
  month: number
  year: number
  type: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  description?: string
}

interface ChargeConfig {
  maintenanceAmount: number
  utilityCharges: number
  parkingFee: number
  specialAssessments: number
  lateFeePenalty: number
  otherCharges: number
  description: string
}

interface GenerationResult {
  id: string
  flatNumber: string
  residentName: string
  status: 'pending' | 'generating' | 'success' | 'error'
  billId?: string
  error?: string
  generatedAt?: string
}

interface GenerationProgressStepProps {
  residents: SelectedResident[]
  billingPeriod: BillingPeriod
  charges: ChargeConfig
  onComplete?: (results: GenerationResult[]) => void
  onBack?: () => void
}

export function GenerationProgressStep({
  residents,
  billingPeriod,
  charges,
  onComplete,
  onBack
}: GenerationProgressStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<GenerationResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  // Initialize results with pending status
  const initializeResults = useCallback(() => {
    const initialResults: GenerationResult[] = residents.map(resident => ({
      id: resident.id,
      flatNumber: resident.flatNumber,
      residentName: resident.residentName,
      status: 'pending'
    }))
    setResults(initialResults)
  }, [residents])

  useEffect(() => {
    initializeResults()
  }, [initializeResults])

  const updateResultStatus = (residentId: string, status: GenerationResult['status'], data?: Partial<GenerationResult>) => {
    setResults(prev => prev.map(result => 
      result.id === residentId 
        ? { ...result, status, ...data }
        : result
    ))
  }

  const startGeneration = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress(0)
    setCurrentStep("Preparing bill generation...")

    try {
      // Prepare bill data in the format expected by the API
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + 1) // Set due date to next month
      
      const billData = {
        month: billingPeriod.month,
        year: billingPeriod.year,
        billType: billingPeriod.type,
        baseAmount: charges.maintenanceAmount,
        dueDate: dueDate.toISOString(),
        selectedResidents: residents.map(r => r.id), // Add selected resident IDs
        additionalCharges: {
          waterCharges: charges.utilityCharges,
          electricityCharges: 0,
          parkingCharges: charges.parkingFee,
          maintenanceCharges: charges.specialAssessments,
          securityCharges: charges.lateFeePenalty,
          clubhouseCharges: 0,
          sewageCharges: 0,
          otherCharges: charges.otherCharges
        }
      }

      setCurrentStep("Generating bills...")
      setProgress(10)

      // Update all residents to generating status
      residents.forEach(resident => {
        updateResultStatus(resident.id, 'generating')
      })

      // Call bulk bill generation API
      const response = await generateBulkBills(billData)

      if (response.success && response.data) {
        const { generated, bills, errors } = response.data

        setProgress(80)
        setCurrentStep("Processing results...")

        // Update successful generations - use bills array for details
        if (bills && bills.length > 0) {
          bills.forEach((bill) => {
            // Find matching resident by flat number
            const matchingResident = residents.find(r => r.flatNumber === bill.flatNumber)
            if (matchingResident) {
              updateResultStatus(matchingResident.id, 'success', {
                billId: bill.billNumber, // Using billNumber as ID since it's available
                generatedAt: new Date().toISOString()
              })
            }
          })
        }

        // Update failed generations
        if (errors && errors.length > 0) {
          errors.forEach((error) => {
            // Find matching resident by flat number
            const matchingResident = residents.find(r => r.flatNumber === error.flatNumber)
            if (matchingResident) {
              updateResultStatus(matchingResident.id, 'error', {
                error: error.error || 'Generation failed'
              })
            }
          })
        }

        setProgress(100)
        setCurrentStep(`Generated ${generated} bills successfully!`)
        setCompleted(true)

        // Call completion callback
        if (onComplete) {
          const finalResults: GenerationResult[] = [
            // Map successful bills
            ...(bills || []).map((bill) => {
              const matchingResident = residents.find(r => r.flatNumber === bill.flatNumber)
              return {
                id: matchingResident?.id || '',
                flatNumber: bill.flatNumber,
                residentName: matchingResident?.residentName || 'Unknown',
                status: 'success' as const,
                billId: bill.billNumber,
                generatedAt: new Date().toISOString()
              }
            }),
            // Map failed bills
            ...(errors || []).map((error) => {
              const matchingResident = residents.find(r => r.flatNumber === error.flatNumber)
              return {
                id: matchingResident?.id || '',
                flatNumber: error.flatNumber,
                residentName: matchingResident?.residentName || 'Unknown',
                status: 'error' as const,
                error: error.error || 'Generation failed'
              }
            })
          ]
          onComplete(finalResults)
        }

      } else {
        throw new Error('Failed to generate bills')
      }

    } catch (err) {
      console.error('Bill generation error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      
      // Mark all as error
      residents.forEach(resident => {
        updateResultStatus(resident.id, 'error', {
          error: 'Generation failed'
        })
      })
      
      setCurrentStep("Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusIcon = (status: GenerationResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: GenerationResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'generating':
        return <Badge variant="default" className="bg-blue-500">Generating</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const totalCount = results.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bill Generation Progress
          </CardTitle>
          <CardDescription>
            {!isGenerating && !completed && "Ready to generate bills for selected residents"}
            {isGenerating && "Generating bills, please wait..."}
            {completed && "Bill generation completed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generation Summary */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Generation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                  <div className="text-sm text-muted-foreground">Total Bills</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-muted-foreground">Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {currentStep && (
                  <p className="text-sm text-muted-foreground">{currentStep}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Generation Error</span>
                </div>
                <p className="text-sm text-destructive mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Individual Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Individual Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={result.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">
                              Flat {result.flatNumber} - {result.residentName}
                            </div>
                            {result.error && (
                              <div className="text-sm text-red-600">{result.error}</div>
                            )}
                            {result.billId && (
                              <div className="text-sm text-muted-foreground">
                                Bill ID: {result.billId}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(result.status)}
                          {result.status === 'success' && result.billId && (
                            <Button size="sm" variant="outline" className="h-8">
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < results.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              disabled={isGenerating}
            >
              Back to Review
            </Button>
            
            <div className="flex gap-2">
              {!completed && !isGenerating && (
                <Button onClick={startGeneration} className="bg-primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Start Generation
                </Button>
              )}
              
              {error && (
                <Button onClick={startGeneration} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              
              {completed && (
                <Button onClick={() => window.location.href = '/admin/billing'}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}