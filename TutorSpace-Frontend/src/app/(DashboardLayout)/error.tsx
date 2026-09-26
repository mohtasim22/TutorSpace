"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RotateCcw } from "lucide-react"

/**
 * Dashboard-scoped error boundary. Sits below the dashboard layout, so a
 * failure on one page keeps the sidebar and header in place and the user can
 * navigate elsewhere instead of losing the whole shell.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard page error:", error)
  }, [error])

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <Card>
        <CardContent className="py-12 text-center space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Couldn&apos;t load this page</h2>
            <p className="text-sm text-muted-foreground">
              The server didn&apos;t respond as expected. Your data is safe — try
              loading the page again.
            </p>
          </div>

          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
