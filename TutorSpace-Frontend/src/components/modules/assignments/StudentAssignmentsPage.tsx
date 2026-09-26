"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { FileText, CalendarClock, Upload, CheckCircle2 } from "lucide-react"
import { submitAssignment } from "@/services/assignments"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"

type Submission = {
  id: string
  file_url: string
  grade?: number | null
  feedback?: string | null
  status: "SUBMITTED" | "GRADED"
}

type Assignment = {
  id: string
  title: string
  description: string
  due_date?: string | null
  course?: { name?: string }
  tutor?: { display_name?: string }
  submissions?: Submission[] // the student's own (0 or 1)
}

export default function StudentAssignmentsPage({
  assignments,
}: {
  assignments: Assignment[]
}) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (assignmentId: string) => {
    if (!file) {
      toast.error("Please choose a file")
      return
    }
    try {
      setBusy(true)
      // 1) Upload the file to Cloudinary (returns a hosted URL).
      const fileUrl = await uploadToCloudinary(file)
      // 2) Save the submission (the URL) against the assignment.
      const res = await submitAssignment(assignmentId, {
        file_url: fileUrl,
        note: note || undefined,
      })
      if (res?.status === "success") {
        toast.success("Submitted!")
        setOpenId(null)
        setFile(null)
        setNote("")
        router.refresh()
      } else {
        toast.error(res?.message || "Failed to submit")
      }
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="h-6 w-6" />
        Assignments
      </h1>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assignments yet. Once you book a course, its assignments show up
            here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const mine = a.submissions?.[0]
            return (
              <div
                key={a.id}
                className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* ---- Left: assignment info ---- */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{a.title}</h3>
                    <Badge variant="outline">{a.course?.name ?? "Course"}</Badge>
                    {a.tutor?.display_name && (
                      <span className="text-xs text-muted-foreground">
                        by {a.tutor.display_name}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {a.description}
                  </p>

                  {a.due_date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3 w-3" />
                      Due {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}

                  {mine?.status === "GRADED" && mine.feedback && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Feedback:{" "}
                      </span>
                      {mine.feedback}
                    </p>
                  )}
                </div>

                {/* ---- Right: status + action ---- */}
                <div className="flex items-center gap-4 md:justify-end shrink-0">
                  {mine && (
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 justify-end text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                        {mine.status === "GRADED" ? "Graded" : "Submitted"}
                      </div>
                      {mine.status === "GRADED" && (
                        <div className="font-medium text-foreground">
                          Grade: {mine.grade}
                        </div>
                      )}
                    </div>
                  )}

                  <Dialog
                    open={openId === a.id}
                    onOpenChange={(o) => {
                      setOpenId(o ? a.id : null)
                      setFile(null)
                      setNote("")
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant={mine ? "outline" : "default"}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {mine ? "Resubmit" : "Submit"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit: {a.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">File</label>
                          <Input
                            type="file"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] ?? null)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Note (optional)
                          </label>
                          <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Anything you want your tutor to know"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => handleSubmit(a.id)}
                          disabled={busy}
                        >
                          {busy ? "Uploading..." : "Submit"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
