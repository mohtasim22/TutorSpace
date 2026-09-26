
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { createBooking } from "@/services/bookings"

interface Props {
  slotId: string
  tutorId: string
}

export default function BookSlotButton({ slotId, tutorId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleBooking = async () => {
    if (!session?.user) {
      router.push(`/login?redirect=/course-slots/${slotId}`)
      return
    }

    try {
      setLoading(true)
      const res = await createBooking({
        course_slot_id: slotId,
        tutor_id: tutorId
      })

      if (res?.status === "success") {
        toast.success("Slot booked! Go to your dashboard to complete payment.")
        router.push("/dashboard/bookings")
      } else {
        toast.error(res?.message || "Failed to book slot")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" size="lg" onClick={handleBooking} disabled={loading}>
      {loading ? "Booking..." : "Book This Slot"}
    </Button>
  )
}