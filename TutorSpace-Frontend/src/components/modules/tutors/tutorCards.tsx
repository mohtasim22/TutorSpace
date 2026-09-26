"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { formatBDT, formatRate, TAKA } from "@/lib/currency"

type Tutor = {
  id: string
  display_name: string
  bio: string
  qualification: string
  rating_avg: number
  total_reviews: number
  is_verified: boolean
  hourly_rate?: number
}

interface Props {
  tutor: Tutor
}

export default function TutorProfileCard({ tutor }: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const initials = tutor.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleViewProfile = () => {
    if (!session?.user) {
      router.push(`/login?redirect=/tutors/${tutor.id}`);
      return;
    }
    router.push(`/tutors/${tutor.id}`);
  };

  return (
    // h-full + flex-col lets the card fill its grid cell, so every card in a
    // row is the height of the tallest one rather than of its own content.
    <Card className="w-full h-full flex flex-col transition hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* min-w-0 allows the child truncation below to actually take effect */}
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="truncate">{tutor.display_name}</span>
            {tutor.is_verified && (
              <Badge variant="secondary" className="shrink-0">Verified</Badge>
            )}
          </CardTitle>

          {/* Two lines are reserved whether the qualification needs them or
              not — otherwise a short one ("MSc in Physics, BUET") makes its
              card shorter than the rest of the row. */}
          <p className="mt-1 text-sm text-muted-foreground flex items-start gap-1 min-h-10">
            <GraduationCap className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{tutor.qualification.toUpperCase()}</span>
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        {/* Same reasoning: always three lines tall, clipped if longer. */}
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-15">
          {tutor.bio || "No bio provided."}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{tutor.rating_avg}</span>
            <span className="text-muted-foreground">
              ({tutor.total_reviews} reviews)
            </span>
          </div>
          {tutor.hourly_rate != null && (
            <div className="flex items-center gap-1 font-semibold text-green-600">
              {formatRate(tutor.hourly_rate)}
            </div>
          )}
        </div>

        {/* mt-auto pins the button to the bottom edge of every card, so the
            buttons line up across the row. */}
        <Button className="w-full mt-auto" onClick={handleViewProfile}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}