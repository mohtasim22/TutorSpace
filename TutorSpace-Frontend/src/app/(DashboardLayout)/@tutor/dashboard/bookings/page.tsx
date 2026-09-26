// @tutor/dashboard/bookings/page.tsx
import TutorBookingsPage from "@/components/modules/bookings/TutorBookingsPage"
import { getBookings, getTutorBookings } from "@/services/bookings"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"

export default async function TutorBookingsRoute() {
  const user = await getUser()
  const bookings = await getBookings()

  return <TutorBookingsPage initialBookings={bookings ?? []} />
}