// @student/dashboard/calendar/page.tsx

import CalendarView, {
  CalendarEvent,
} from "@/components/modules/calendar/CalendarView"
import { getBookings } from "@/services/bookings"
import { Suspense } from "react"

export default async function StudentCalendarPage() {
  const bookings = await getBookings()

  // A student's calendar is driven by the sessions they booked.
  const events: CalendarEvent[] = (bookings ?? [])
    .filter((b: any) => b?.courseSlot?.date)
    .map((b: any) => ({
      id: b.id,
      title: b.courseSlot.name ?? "Session",
      start: b.courseSlot.start_time,
      end: b.courseSlot.end_time,
      date: b.courseSlot.date,
      capacity: b.courseSlot.capacity,
      bookedCount: b.courseSlot._count?.bookings ?? 0,
      courseSlotId: b.courseSlot.id,
      meetingLink: b.courseSlot.meeting_link,
    }))

  return (
    <Suspense fallback={null}>
      <CalendarView events={events} />
    </Suspense>
  )
}
