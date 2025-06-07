"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"

// Form validation schema
const loginFormSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (value) => {
        // Check if it's a valid email or phone
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        return emailRegex.test(value) || phoneRegex.test(value)
      },
      "Please enter a valid email or phone number"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await login(values)
      
      if (result.success) {
        setSuccess("Login successful! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError(result.error || "Login failed")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Login to Your Account</h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your dashboard
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                {/* Email/Phone Field */}
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email or Phone</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your email or phone number"
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
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
                        <FormLabel className="text-sm font-normal mb-0">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <Link href="/register">
                <Button variant="outline" className="w-full h-11">
                  Create New Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
