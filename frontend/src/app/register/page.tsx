"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"

// Form validation schema
const registerFormSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
  
  // Residence Information
  flatNumber: z
    .string()
    .min(1, "Flat number is required")
    .max(10, "Flat number cannot exceed 10 characters"),
  building: z.string().max(50, "Building name cannot exceed 50 characters").optional(),
  societyName: z
    .string()
    .min(2, "Society name must be at least 2 characters")
    .max(100, "Society name cannot exceed 100 characters"),
  
  // Address (Optional)
  street: z.string().max(200, "Street address cannot exceed 200 characters").optional(),
  city: z.string().max(50, "City name cannot exceed 50 characters").optional(),
  state: z.string().max(50, "State name cannot exceed 50 characters").optional(),
  pincode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit pincode").optional().or(z.literal("")),
  
  // Terms and Conditions
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const { register } = useAuth()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      flatNumber: "",
      building: "",
      societyName: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      agreeToTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare data for API
      const registerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        flatNumber: values.flatNumber,
        building: values.building,
        societyName: values.societyName,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
      }

      const result = await register(registerData)
      
      if (result.success) {
        setSuccess("Registration successful! Please check your email for verification.")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(result.error || "Registration failed")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ["firstName", "lastName", "email", "phone", "password", "confirmPassword"]
      : ["flatNumber", "societyName"]

    const result = await form.trigger(fieldsToValidate as (keyof RegisterFormValues)[])
    if (result) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Society Ease
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Your Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join your society&apos;s digital management platform
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              1
            </div>
            <span className="text-sm font-medium">Personal Info</span>
          </div>
          <div className="w-12 h-px bg-gray-300" />
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              2
            </div>
            <span className="text-sm font-medium">Residence Details</span>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {currentStep === 1 ? "Personal Information" : "Residence & Address Details"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 
                  ? "Enter your personal details to get started" 
                  : "Provide your residence information for verification"
                }
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Error/Success Messages */}
                {error && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>First Name</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your first name"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your last name"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email Address</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email address"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>Phone Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your 10-digit mobile number"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your Indian mobile number (10 digits)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Fields */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder="Create a secure password"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>
                            Must be at least 6 characters with uppercase, lowercase, and number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder="Confirm your password"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Residence Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    {/* Residence Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="flatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Home className="h-4 w-4" />
                              <span>Flat Number</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., A-101, 205"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="building"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Building (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Tower A, Block B"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="societyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>Society Name</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your society name"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address Details (Optional) */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Address Details (Optional)</span>
                      </h3>

                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter street address"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="City"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="State"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="6-digit pincode"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the{" "}
                              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Form Navigation */}
                <div className="flex justify-between pt-6">
                  {currentStep === 1 ? (
                    <Link href="/login">
                      <Button variant="outline" type="button">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" type="button" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {currentStep === 1 ? (
                    <Button type="button" onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
