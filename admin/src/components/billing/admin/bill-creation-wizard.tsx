"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BillingPeriodStep } from "./bill-creation-steps/billing-period-step"
import { ResidentSelectionStep } from "./bill-creation-steps/resident-selection-step"
import { ChargesStep } from "./bill-creation-steps/charges-step"
import { ReviewStep } from "./bill-creation-steps/review-step"
import { GenerationProgressStep } from "./bill-creation-steps/generation-progress-step"

// Import the GenerationResult type
type GenerationResult = {
  id: string
  flatNumber: string
  residentName: string
  status: 'pending' | 'generating' | 'success' | 'error'
  billId?: string
  error?: string
  generatedAt?: string
}
import { 
  X, 
  Calendar, 
  Users, 
  DollarSign, 
  Eye, 
  CheckCircle,
  ArrowLeft,
  ArrowRight 
} from "lucide-react"
import { LucideIcon } from "lucide-react"

interface BillCreationWizardProps {
  onClose: () => void
  onComplete: () => void
}

interface WizardStep {
  id: number
  title: string
  description: string
  icon: LucideIcon
  isComplete: boolean
}

interface BillingPeriod {
  month: number
  year: number
  type: 'maintenance' | 'special_assessment' | 'penalty' | 'other'
  description?: string
}

interface SelectedResident {
  id: string
  flatNumber: string
  building?: string
  ownerName: string
  email: string
  phone: string
  isSelected: boolean
}

interface ChargeConfig {
  maintenanceAmount: number
  utilityCharges: number
  specialAssessments: number
  lateFeePenalty: number
  otherCharges: number
  description: string
}

export function BillCreationWizard({ onClose, onComplete }: BillCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [generationComplete, setGenerationComplete] = useState(false)
  
  // Form state
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'maintenance',
    description: ''
  })
  
  const [selectedResidents, setSelectedResidents] = useState<SelectedResident[]>([])
  const [charges, setCharges] = useState<ChargeConfig>({
    maintenanceAmount: 5500,
    utilityCharges: 1200,
    specialAssessments: 0,
    lateFeePenalty: 0,
    otherCharges: 0,
    description: ''
  })

  const steps: WizardStep[] = [
    {
      id: 1,
      title: "Billing Period",
      description: "Select period and bill type",
      icon: Calendar,
      isComplete: currentStep > 1
    },
    {
      id: 2,
      title: "Select Residents",
      description: "Choose flats to bill",
      icon: Users,
      isComplete: currentStep > 2
    },
    {
      id: 3,
      title: "Set Charges",
      description: "Configure billing amounts",
      icon: DollarSign,
      isComplete: currentStep > 3
    },
    {
      id: 4,
      title: "Review & Preview",
      description: "Review details and preview",
      icon: Eye,
      isComplete: currentStep > 4 || generationComplete
    }
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 4) {
      // Move to generation step
      setCurrentStep(5)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerationComplete = (results: GenerationResult[]) => {
    setGenerationComplete(true)
    console.log('Generation completed with results:', results)
    // Call the parent completion callback after a brief delay
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  const handleBackToReview = () => {
    setCurrentStep(4)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return billingPeriod.month && billingPeriod.year && billingPeriod.type
      case 2:
        return selectedResidents.some(r => r.isSelected)
      case 3:
        return charges.maintenanceAmount > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const getStepContent = () => {
    if (currentStep === 5) {
      // Convert selected residents to the format expected by GenerationProgressStep
      const selectedResidentsForGeneration = selectedResidents
        .filter(r => r.isSelected)
        .map(resident => ({
          id: resident.id,
          flatNumber: resident.flatNumber,
          residentName: resident.ownerName,
          building: resident.building
        }))

      return (
        <GenerationProgressStep
          residents={selectedResidentsForGeneration}
          billingPeriod={billingPeriod}
          charges={charges}
          onComplete={handleGenerationComplete}
          onBack={handleBackToReview}
        />
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <BillingPeriodStep
            value={billingPeriod}
            onChange={setBillingPeriod}
          />
        )
      case 2:
        return (
          <ResidentSelectionStep
            residents={selectedResidents}
            onChange={setSelectedResidents}
          />
        )
      case 3:
        return (
          <ChargesStep
            charges={charges}
            onChange={setCharges}
            billingType={billingPeriod.type}
          />
        )
      case 4:
        return (
          <ReviewStep
            billingPeriod={billingPeriod}
            selectedResidents={selectedResidents.filter(r => r.isSelected)}
            charges={charges}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">Create Bills</CardTitle>
            <CardDescription>
              Generate bills for your society residents
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      {currentStep <= 4 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStep / steps.length) * 100)}% Complete
                </span>
              </div>
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-full border-2 
                      ${step.isComplete ? 'bg-primary border-primary text-primary-foreground' : 
                        currentStep === step.id ? 'border-primary text-primary' : 
                        'border-muted text-muted-foreground'}
                    `}>
                      {step.isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {getStepContent()}
      </div>

      {/* Navigation */}
      {currentStep <= 4 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  {currentStep === 4 ? 'Generate Bills' : 'Next'}
                  {currentStep !== 4 && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
