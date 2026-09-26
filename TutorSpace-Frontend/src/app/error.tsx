"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

/**
 * Route-level error boundary.
 *
 * Without this, any error thrown while rendering a page produced the raw
 * Next.js overlay in development and a blank screen in production. Data
 * fetching is the usual cause — the API being unreachable, or a record that
 * does not exist — so the recovery offered is a retry rather than a dead end.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces the cause in the browser console and in server logs, where a
    // silent failure would otherwise leave nothing to debug from.
    console.error("Page error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load this page. This is usually temporary — please
              try again.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/70">
                Reference: {error.digest}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
