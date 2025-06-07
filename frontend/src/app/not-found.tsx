import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Society Ease</h1>
              <p className="text-sm text-muted-foreground">Resident Portal</p>
            </div>
          </div>

          {/* 404 Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="text-center">
              <div className="mb-4">
                <div className="text-8xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  404
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
              <CardDescription className="text-base">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>You might want to check the URL or return to the dashboard.</p>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button asChild className="w-full" size="lg">
                  <Link href="/resident/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full" size="lg">
                  <Link href="javascript:history.back()">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Link>
                </Button>
              </div>

              <div className="pt-6 border-t">
                <div className="text-center text-xs text-muted-foreground">
                  <p>Need help? Contact society management</p>
                  <p className="mt-1">
                    <Link href="/resident/help" className="text-primary hover:underline">
                      Support Center
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
