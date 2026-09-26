import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Megaphone } from "lucide-react"

type Announcement = {
  id: string
  message: string
  createdAt: string
  course?: { name?: string }
}

export default function StudentAnnouncementsPage({
  announcements,
}: {
  announcements: Announcement[]
}) {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Megaphone className="h-6 w-6" />
        Announcements
      </h1>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No announcements yet. Updates from your tutors will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{a.course?.name ?? "Course"}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
