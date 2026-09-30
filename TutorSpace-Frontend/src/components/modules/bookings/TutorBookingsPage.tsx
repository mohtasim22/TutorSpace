"use client"

import { useState } from "react"
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
import { BookOpen, Calendar, Clock, CheckCircle, XCircle, Link2 } from "lucide-react"
import { toast } from "sonner"
import { updateBookingStatus, cancelBooking } from "@/services/bookings"
import { formatBDT } from "@/lib/currency"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
  CardActions,
} from "@/components/shared/responsiveTable"
// import { updateBookingStatus } from "@/services/bookings"

type Booking = {
  id: string
  student_id: string
  booking_status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  payment_status?: "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
  total_price?: number
  createdAt: string
  courseSlot: {
    id: string
    name: string
    description: string
    start_time: string
    end_time: string
    date: string
  }
  student: {
    name: string
    email: string
  }
}

interface Props {
  initialBookings: Booking[]
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

export default function TutorBookingsPage({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  /**
   * A tutor cancelling goes through the dedicated cancel endpoint, not the
   * generic status PATCH. The PATCH only flips a status — it would leave a paid
   * student cancelled and out of pocket. The cancel endpoint refunds them.
   */
  const handleCancel = async (bookingId: string) => {
    try {
      setLoadingId(bookingId)
      const res = await cancelBooking(bookingId)
      if (res?.status === "success") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  booking_status: "CANCELLED" as const,
                  ...(res.refunded
                    ? { payment_status: "REFUNDED" as const }
                    : {}),
                }
              : b
          )
        )
        toast.success(
          res.refunded
            ? "Booking cancelled and the student has been refunded"
            : "Booking cancelled"
        )
      } else {
        toast.error(res?.message || "Could not cancel this booking")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoadingId(null)
    }
  }

  const handleUpdateStatus = async (
    bookingId: string,
    status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED"
  ) => {
    try {
      setLoadingId(bookingId)
      const res = await updateBookingStatus(bookingId, status)

      if (res?.status === "success") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, booking_status: status } : b
          )
        )
        toast.success(
          status === "CONFIRMED"
            ? "Booking confirmed successfully"
            : "Booking cancelled successfully"
        )
      } else {
        toast.error("Failed to update booking status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoadingId(null)
    }
  }

  // Shared by the table and the mobile cards. A plain function, not a
  // component, so the dialogs keep their element identity across renders.
  const renderActions = (booking: Booking) => (
    <>
                        {/* Confirm — show if PENDING or CANCELLED */}
                        {(booking.booking_status === "PENDING" || booking.booking_status === "CANCELLED") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                disabled={loadingId === booking.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to confirm this booking for{" "}
                                  <strong>{booking.student.name}</strong>? They will
                                  receive access to the meeting link.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Back</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Cancel — show if PENDING or CONFIRMED */}
                        {(booking.booking_status === "PENDING" || booking.booking_status === "CONFIRMED") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                disabled={loadingId === booking.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="space-y-2">
                                    <p>
                                      Cancel this booking for{" "}
                                      <strong>{booking.student.name}</strong>?
                                    </p>
                                    {booking.payment_status === "PAID" && (
                                      <p className="font-medium text-foreground">
                                        They will be refunded{" "}
                                        {formatBDT(booking.total_price ?? 0)} in full —
                                        a tutor cancellation is always refunded,
                                        whatever the timing.
                                      </p>
                                    )}
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        

                        {/* Make Pending — show if CONFIRMED or CANCELLED */}
                        {(booking.booking_status === "CONFIRMED" || booking.booking_status === "CANCELLED") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                disabled={loadingId === booking.id}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Pending
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Set to Pending</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to set this booking back to pending for{" "}
                                  <strong>{booking.student.name}</strong>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Back</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleUpdateStatus(booking.id, "PENDING")}
                                >
                                  Set Pending
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <Button
                          size="sm"
                          asChild
                          className="relative group overflow-hidden bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 gap-2"
                        >
                          <a href={`/dashboard/call/${booking.courseSlot.id}`}>
                            <Link2 className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                            Join Meeting
                          </a>
                        </Button>

                        {/* Complete — show only if CONFIRMED */}
{booking.booking_status === "CONFIRMED" && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        size="sm"
        variant="outline"
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
        disabled={loadingId === booking.id}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Complete
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to mark this booking for{" "}
          <strong>{booking.student.name}</strong> as completed?
          This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Back</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => handleUpdateStatus(booking.id, "COMPLETED")}
        >
          Mark Complete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}

{/* No actions for COMPLETED */}
{booking.booking_status === "COMPLETED" && (
  <span className="text-xs text-muted-foreground">—</span>
)}
    </>
  )

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Booked Slots</h1>
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

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Booking Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No bookings yet.
            </div>
          ) : (
            <>
            <TableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot</TableHead>
                  <TableHead>Student</TableHead>
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
                    {/* Slot */}
                    <TableCell>
                      <div className="font-medium">{booking.courseSlot.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.courseSlot.description}
                      </div>
                    </TableCell>

                    {/* Student */}
                    <TableCell>
                      <div className="text-sm font-medium">{booking.student.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.student.email}</div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(booking.courseSlot.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    {/* Time */}
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(booking.courseSlot.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" — "}
                      {new Date(booking.courseSlot.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={statusVariant[booking.booking_status]}>
                        {booking.booking_status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
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

            {/* Phones: a card per request. The confirm/cancel/complete controls
                are the point of this page and sat in the last column of a
                six-column table, off the right edge at this width. */}
            <CardView>
              {bookings.map((booking) => (
                <MobileCard key={booking.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {booking.courseSlot.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {booking.courseSlot.description}
                      </div>
                    </div>
                    <Badge variant={statusVariant[booking.booking_status]}>
                      {booking.booking_status}
                    </Badge>
                  </div>

                  <Field label="Student">
                    <span className="block">{booking.student.name}</span>
                    <span className="block text-xs text-muted-foreground break-all">
                      {booking.student.email}
                    </span>
                  </Field>
                  <Field label="Date">
                    {new Date(booking.courseSlot.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Field>
                  <Field label="Time">
                    {new Date(booking.courseSlot.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {new Date(booking.courseSlot.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Field>

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