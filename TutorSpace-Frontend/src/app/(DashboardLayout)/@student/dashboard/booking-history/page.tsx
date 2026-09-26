// @student/dashboard/history/page.tsx
import StudentBookingHistoryPage from "@/components/modules/bookings/StudentBookingHistoryPage"
import { getBookings} from "@/services/bookings"
import { getUser } from "@/services/auth"

export default async function BookingHistoryPage() {
  const user = await getUser()
  const bookings = await getBookings()

  // filter only completed bookings
  const completedBookings = bookings?.filter(
    (b: any) => b.booking_status === "COMPLETED"
  ) ?? []

  return <StudentBookingHistoryPage bookings={completedBookings} />
}