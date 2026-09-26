// @student/dashboard/bookings/page.tsx

import { getUser } from "@/services/auth"
import StudentBookingsPage from "@/components/modules/bookings/StudentBookingsPage"
import { getBookings } from "@/services/bookings"
import { Suspense } from "react"

export default async function BookingsPage() {
  const user = await getUser()
  const bookings = await getBookings()

  return (
    <Suspense fallback={null}>
      <StudentBookingsPage bookings={bookings ?? []} />
    </Suspense>
  )
}