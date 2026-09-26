"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Calendar, Clock, CreditCard, Link2, User, XCircle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { createCheckoutSession, cancelBooking } from "@/services/bookings"
import { previewCancellation } from "@/lib/cancellation"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
  CardActions,
} from "@/components/shared/responsiveTable"
import { formatBDT } from "@/lib/currency"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Booking = {
  id: string
  student_id: string
  tutor_id: string
  course_slot_id: string
  booking_status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  payment_status?: "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
  total_price?: number
  createdAt: string
  updatedAt: string
  tutor: {
    display_name: string
    qualification: string
    is_verified: boolean
  }
  courseSlot: {
    id: string
    name: string
    description: string
    start_time: string
    end_time: string
    date: string
    meeting_link: string
  }
}

interface Props {
  bookings: Booking[]
}

const statusVariant: Record<
  Booking["booking_status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  CANCELLED: "destructive",
  COMPLETED: "outline",
}

export default function StudentBookingsPage({ bookings }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [payingId, setPayingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    const payment = searchParams.get("payment")
    if (payment === "success") {
      toast.success("Payment successful! Your booking has been confirmed.")
    } else if (payment === "cancelled") {
      toast.error("Payment was cancelled. You can try again from your bookings.")
    }
  }, [searchParams])

  const handlePayNow = async (bookingId: string) => {
    try {
      setPayingId(bookingId)
      const res = await createCheckoutSession(bookingId)
      if (res?.url) {
        window.location.href = res.url
      } else {
        toast.error(res?.message || "Failed to create payment session")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setPayingId(null)
    }
  }

  const handleCancel = async (bookingId: string) => {
    try {
      setCancellingId(bookingId)
      const res = await cancelBooking(bookingId)
      if (res?.status === "success") {
        // Report what the SERVER did, not what the dialog predicted — the
        // server is authoritative and may have decided differently.
        toast.success(
          res.refunded
            ? "Booking cancelled and your refund is on its way"
            : "Booking cancelled"
        )
        router.refresh()
      } else {
        toast.error(res?.message || "Could not cancel this booking")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCancellingId(null)
    }
  }

  // Status and action markup is shared by the table and the mobile cards below.
  // Plain functions rather than components, so React keeps one element identity
  // per row instead of remounting the dialogs on every parent render.
  const renderStatus = (booking: Booking) => (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant={statusVariant[booking.booking_status]}>
        {booking.booking_status}
      </Badge>
      {booking.payment_status && (
        <Badge
          variant={booking.payment_status === "PAID" ? "default" : "outline"}
          className="text-[10px]"
        >
          {booking.payment_status === "PAID"
            ? "💳 Paid"
            : booking.payment_status === "REFUNDED"
              ? "↩ Refunded"
              : "Unpaid"}
        </Badge>
      )}
    </div>
  )

  const renderActions = (booking: Booking) => (
    <>
      {booking.payment_status !== "PAID" ? (
        <Button
          size="sm"
          onClick={() => handlePayNow(booking.id)}
          disabled={payingId === booking.id}
          className="relative group overflow-hidden bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 gap-2"
        >
          <CreditCard className="h-4 w-4" />
          <span className="relative z-10">
            {payingId === booking.id ? "Redirecting..." : "Pay Now"}
          </span>
        </Button>
      ) : booking.booking_status === "CONFIRMED" && booking.payment_status === "PAID" ? (
        <Button
          size="sm"
          asChild
          className="relative group overflow-hidden bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 gap-2"
        >
          <a href={`/dashboard/call/${booking.courseSlot.id}`}>
            <Link2 className="h-4 w-4" />
            Join Meeting
          </a>
        </Button>
      ) : null}

      {/* Cancelling only applies while the session is still ahead of them. */}
      {(booking.booking_status === "PENDING" ||
        booking.booking_status === "CONFIRMED") && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive hover:text-destructive"
              disabled={cancellingId === booking.id}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                {(() => {
                  const preview = previewCancellation(
                    booking.courseSlot.start_time,
                    booking.payment_status
                  )
                  return (
                    <div className="space-y-2">
                      <p>
                        &ldquo;{booking.courseSlot.name}&rdquo; will be cancelled
                        and your seat released.
                      </p>
                      {!preview.wasPaid ? (
                        <p>
                          You haven&apos;t paid for this booking, so there is
                          nothing to refund.
                        </p>
                      ) : preview.refundable ? (
                        <p className="font-medium text-foreground">
                          You&apos;ll be refunded{" "}
                          {formatBDT(booking.total_price ?? 0)} to your original
                          payment method.
                        </p>
                      ) : (
                        <p className="font-medium text-foreground">
                          This is within {preview.windowHours} hours of the
                          session, so no refund will be issued.
                        </p>
                      )}
                    </div>
                  )
                })()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep booking</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleCancel(booking.id)}>
                Cancel booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">My Bookings</h1>
        <Badge variant="outline">{bookings.length} total</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {bookings.filter((b) => b.booking_status === status).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No bookings yet.
            </div>
          ) : (
            <>
              {/* ---- Wide screens: the table ---- */}
              <TableView>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slot</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Tutor
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Time
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.courseSlot.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.courseSlot.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{booking.tutor.display_name}</span>
                            {booking.tutor.is_verified && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                &#10003;
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {booking.tutor.qualification}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {fmtDate(booking.courseSlot.date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {fmtTime(booking.courseSlot.start_time)}
                          {" — "}
                          {fmtTime(booking.courseSlot.end_time)}
                        </TableCell>
                        <TableCell>{renderStatus(booking)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {renderActions(booking)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableView>

              {/* ---- Phones: one card per booking. A six-column table can only
                   be read by swiping at this width, and the actions end up off
                   the right edge where nobody finds them. ---- */}
              <CardView>
                {bookings.map((booking) => (
                  <MobileCard key={booking.id}>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {booking.courseSlot.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {booking.courseSlot.description}
                      </div>
                    </div>

                    {renderStatus(booking)}

                    <Field label="Tutor">
                      <span className="inline-flex items-center gap-1">
                        {booking.tutor.display_name}
                        {booking.tutor.is_verified && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            &#10003;
                          </Badge>
                        )}
                      </span>
                    </Field>
                    <Field label="Date">{fmtDate(booking.courseSlot.date)}</Field>
                    <Field label="Time">
                      {fmtTime(booking.courseSlot.start_time)}
                      {" — "}
                      {fmtTime(booking.courseSlot.end_time)}
                    </Field>
                    {booking.total_price !== undefined && (
                      <Field label="Price">{formatBDT(booking.total_price)}</Field>
                    )}

                    <CardActions>{renderActions(booking)}</CardActions>
                  </MobileCard>
                ))}
              </CardView>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
