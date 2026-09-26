// @student/dashboard/page.tsx
import { getUser } from "@/services/auth"
import { getBookings } from "@/services/bookings"
import { getAssignments } from "@/services/assignments"
import { getAnnouncements } from "@/services/announcements"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarCheck,
  Clock,
  BookOpen,
  Star,
  ArrowRight,
  Video,
  FileText,
  Megaphone,
} from "lucide-react"
import Link from "next/link"

export default async function StudentDashboardPage() {
  const user = await getUser()
  const [bookings, assignments, announcements] = await Promise.all([
    getBookings(),
    getAssignments(),
    getAnnouncements(),
  ])
  const bookingList = bookings ?? []

  const now = new Date()

  const pending = bookingList.filter((b: any) => b.booking_status === "PENDING").length
  const confirmed = bookingList.filter((b: any) => b.booking_status === "CONFIRMED").length
  const completed = bookingList.filter((b: any) => b.booking_status === "COMPLETED").length
  const total = bookingList.length

  // Soonest upcoming session (future, not cancelled).
  const upcoming = bookingList
    .filter(
      (b: any) =>
        b.courseSlot?.start_time &&
        new Date(b.courseSlot.start_time) > now &&
        b.booking_status !== "CANCELLED"
    )
    .sort(
      (a: any, b: any) =>
        +new Date(a.courseSlot.start_time) - +new Date(b.courseSlot.start_time)
    )
  const nextSession = upcoming[0]

  // Assignments still due (not yet submitted by this student).
  const assignmentsDue = (assignments ?? []).filter(
    (a: any) =>
      a.due_date &&
      new Date(a.due_date) > now &&
      !(a.submissions && a.submissions.length)
  )

  const recentBookings = bookingList.slice(0, 3)
  const recentAnnouncements = (announcements ?? []).slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is an overview of your learning activity.
        </p>
      </div>

      {/* Next session highlight */}
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-md bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next session</p>
              {nextSession ? (
                <>
                  <p className="font-semibold">{nextSession.courseSlot?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {nextSession.tutor?.display_name} •{" "}
                    {new Date(nextSession.courseSlot.start_time).toLocaleString(
                      undefined,
                      { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </>
              ) : (
                <p className="font-semibold">No upcoming sessions</p>
              )}
            </div>
          </div>
          {nextSession && (
            <Button asChild className="gap-2">
              <Link href={`/dashboard/call/${nextSession.courseSlot.id}`}>
                <Video className="h-4 w-4" />
                Join
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Total Bookings" value={total} />
        <StatCard icon={<CalendarCheck className="h-4 w-4" />} label="Upcoming" value={upcoming.length} />
        <StatCard icon={<FileText className="h-4 w-4" />} label="Assignments Due" value={assignmentsDue.length} />
        <StatCard icon={<Star className="h-4 w-4" />} label="Completed" value={completed} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignments due */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Assignments Due
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/assignments" className="flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignmentsDue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nothing due. Nice work! 🎉
              </p>
            ) : (
              assignmentsDue.slice(0, 3).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.course?.name}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {new Date(a.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4" /> Announcements
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/announcements" className="flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No announcements yet.
              </p>
            ) : (
              recentAnnouncements.map((a: any) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{a.course?.name}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-2">{a.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/bookings" className="flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentBookings.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No bookings yet.{" "}
              <Link href="/course-slots" className="text-foreground underline">
                Browse slots
              </Link>
            </div>
          ) : (
            recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-sm"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{booking.courseSlot?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.tutor?.display_name} •{" "}
                    {new Date(booking.courseSlot?.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant={
                    booking.booking_status === "CONFIRMED"
                      ? "default"
                      : booking.booking_status === "CANCELLED"
                      ? "destructive"
                      : booking.booking_status === "COMPLETED"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {booking.booking_status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/course-slots">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Slots
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/tutors">
              <Star className="h-4 w-4 mr-2" />
              Find Tutors
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/dashboard/calendar">
              <CalendarCheck className="h-4 w-4 mr-2" />
              Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
