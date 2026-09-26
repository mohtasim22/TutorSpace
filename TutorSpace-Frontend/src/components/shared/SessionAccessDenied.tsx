import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ArrowLeft } from "lucide-react"

/**
 * Shown when the API declines to let someone into a live session.
 *
 * It renders the server's own message rather than a generic refusal, because
 * the reasons are different actions for the user: "opens in 12 minutes" means
 * wait, "waiting for the tutor to confirm" means chase the tutor, and "hasn't
 * been paid for" means go and pay.
 */
export default function SessionAccessDenied({
  message,
}: {
  message?: string
}) {
  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Card>
        <CardContent className="py-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">This session isn&apos;t open</h2>
            <p className="text-sm text-muted-foreground">
              {message || "You don't have access to this session."}
            </p>
          </div>

          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/bookings">
              <ArrowLeft className="h-4 w-4" />
              Back to bookings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
