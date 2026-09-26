// @tutor/dashboard/calendar/page.tsx

import CalendarView, {
  CalendarEvent,
} from "@/components/modules/calendar/CalendarView"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"
import { getSlotByTutor } from "@/services/courseSlots"
import { Suspense } from "react"

export default async function TutorCalendarPage() {
  const user = await getUser()
  const { tutor } = await getTutorProfile({ userId: user?.id })
  const slotsRes = await getSlotByTutor(tutor?.id)
  const slots = slotsRes?.slots ?? []

  // A tutor's calendar is driven by the slots they CREATED — booked or not.
  // `_count.bookings` (from the backend) is how many students booked each.
  const events: CalendarEvent[] = slots
    .filter((s: any) => s?.date)
    .map((s: any) => ({
      id: s.id,
      title: s.name,
      start: s.start_time,
      end: s.end_time,
      date: s.date,
      capacity: s.capacity,
      bookedCount: s._count?.bookings ?? 0,
      courseSlotId: s.id,
      meetingLink: s.meeting_link,
    }))

  return (
    <Suspense fallback={null}>
      <CalendarView events={events} />
    </Suspense>
  )
}
