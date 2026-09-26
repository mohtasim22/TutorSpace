// components/modules/tutors/BookSlotButton.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function BookSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleClick = () => {
    if (!session?.user) {
      router.push(`/login?redirect=/course-slots/${slotId}`)
      return
    }
    router.push(`/course-slots/${slotId}`)
  }

  return (
    <Button size="sm" className="mt-2" onClick={handleClick}>
      Book Slot
    </Button>
  )
}