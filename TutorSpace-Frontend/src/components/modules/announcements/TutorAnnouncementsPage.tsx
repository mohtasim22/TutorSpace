"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Megaphone, Send, Trash2 } from "lucide-react"
import { createAnnouncement, deleteAnnouncement } from "@/services/announcements"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Course = { id: string; name: string }

type Announcement = {
  id: string
  message: string
  createdAt: string
  course?: { name?: string }
}

interface Props {
  announcements: Announcement[]
  courses: Course[]
}

export default function TutorAnnouncementsPage({ announcements, courses }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [courseId, setCourseId] = useState("")
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handlePost = async () => {
    if (!courseId) return toast.error("Please pick a course")
    if (!message.trim()) return toast.error("Please write a message")
    try {
      setBusy(true)
      const res = await createAnnouncement({ message, course_id: courseId })
      if (res?.status === "success") {
        toast.success("Announcement posted")
        setMessage("")
        setCourseId("")
        router.refresh()
      } else {
        toast.error(res?.message || "Failed to post")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await deleteAnnouncement(id)
      if (res?.status === "success") {
        toast.success("Deleted")
        router.refresh()
      } else {
        toast.error(res?.message || "Failed to delete")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Megaphone className="h-6 w-6" />
        Announcements
      </h1>

      {/* Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select onValueChange={setCourseId} value={courseId}>
            <SelectTrigger className="sm:w-64">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Write a short message for your students…"
          />
          <div className="flex justify-end">
            <Button onClick={handlePost} disabled={busy} className="gap-2">
              <Send className="h-4 w-4" />
              {busy ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posted announcements */}
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No announcements yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border p-4 flex items-start gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{a.course?.name ?? "Course"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{a.message}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete announcement"
                    className="text-destructive hover:text-destructive shrink-0"
                    disabled={deletingId === a.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                    <AlertDialogDescription>
                      This announcement will be removed for every student in the
                      course. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
