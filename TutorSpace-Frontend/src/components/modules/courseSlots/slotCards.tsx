"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { formatBDT, formatRate, TAKA } from "@/lib/currency"

type CourseSlot = {
  id: string
  name: string
  start_time: string
  end_time: string
  tutor: {
    display_name: string
    hourly_rate?: number
  }
  course: {
    name: string
  }
}

interface Props {
  slot: CourseSlot
}

export default function CourseSlotCard({ slot }: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const start = new Date(slot.start_time)
  const end = new Date(slot.end_time)

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

  const handleMoreDetails = () => {
    if (!session?.user) {
      router.push(`/login?redirect=/course-slots/${slot.id}`);
      return;
    }
    router.push(`/course-slots/${slot.id}`);
  };  

  return (
    // h-full + flex-col so every card matches the tallest in its grid row.
    <Card className="h-full flex flex-col hover:shadow-lg transition">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2 min-h-14">
          {slot.course.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {slot.name}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(start)}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(start)} — {formatTime(end)}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-1">
          Tutor: {slot.tutor.display_name}
        </p>

        {slot.tutor.hourly_rate != null && (() => {
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          const total = slot.tutor.hourly_rate! * durationHours
          return (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                {formatRate(slot.tutor.hourly_rate)}
              </span>
              <span className="font-semibold text-green-600">{formatBDT(total)}</span>
            </div>
          )
        })()}

        {/* mt-auto aligns the button across every card in the row. */}
        <Button className="w-full mt-auto" onClick={handleMoreDetails}>
          More Details
        </Button>
      </CardContent>
    </Card>
  )
}