import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Compass, Home, Search } from "lucide-react"

/**
 * Shown for unmatched routes, and whenever a page calls `notFound()` — for
 * example a tutor or session id that does not exist. Previously these fell
 * through to the framework default.
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-3">
              <Compass className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Page not found</h2>
            <p className="text-sm text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist, or the tutor or
              session may have been removed.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button asChild className="gap-2">
              <Link href="/tutors">
                <Search className="h-4 w-4" />
                Browse tutors
              </Link>
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
