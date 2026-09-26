"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText, Download, Users, Pencil } from "lucide-react"
import { gradeSubmission } from "@/services/assignments"

type Submission = {
  id: string
  file_url: string
  note?: string | null
  grade?: number | null
  feedback?: string | null
  status: "SUBMITTED" | "GRADED"
  submittedAt: string
  student?: { name?: string; email?: string }
}

type Assignment = {
  id: string
  title: string
  description: string
  due_date?: string | null
  course?: { name?: string }
  submissions: Submission[]
} | null

export default function TutorAssignmentDetail({
  assignment,
}: {
  assignment: Assignment
}) {
  const router = useRouter()

  // Local edit state per submission, keyed by submission id. Seeded from the
  // saved values so re-opening a graded row shows the current grade/feedback.
  const [grades, setGrades] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (assignment?.submissions ?? []).map((s) => [
        s.id,
        s.grade != null ? String(s.grade) : "",
      ])
    )
  )
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (assignment?.submissions ?? []).map((s) => [s.id, s.feedback ?? ""])
    )
  )
  // Which already-graded submission is currently being edited.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  if (!assignment) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <p className="text-muted-foreground">Assignment not found.</p>
        <Link href="/dashboard/assignments" className="text-primary text-sm">
          ← Back to assignments
        </Link>
      </div>
    )
  }

  const handleGrade = async (s: Submission) => {
    const raw = grades[s.id] ?? (s.grade != null ? String(s.grade) : "")
    const grade = Number(raw)
    if (raw === "" || Number.isNaN(grade)) {
      toast.error("Enter a numeric grade")
      return
    }
    try {
      setSavingId(s.id)
      const res = await gradeSubmission(s.id, {
        grade,
        feedback: feedbacks[s.id] ?? s.feedback ?? undefined,
      })
      if (res?.status === "success") {
        toast.success("Graded")
        setEditingId(null) // collapse back to the read-only view
        router.refresh()
      } else {
        toast.error(res?.message || "Failed to grade")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <Link
        href="/dashboard/assignments"
        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to assignments
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          {assignment.title}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline">{assignment.course?.name ?? "Course"}</Badge>
          {assignment.due_date && (
            <span className="text-sm text-muted-foreground">
              Due {new Date(assignment.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {assignment.description}
        </p>
      </div>

      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Users className="h-5 w-5" />
        Submissions ({assignment.submissions.length})
      </h2>

      {assignment.submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {assignment.submissions.map((s) => {
            // Show the editor for anything not yet graded, or when the tutor
            // explicitly clicked "Edit Grade".
            const showEditor = s.status !== "GRADED" || editingId === s.id

            return (
              <div key={s.id} className="rounded-lg border p-3">
                {/* ---- compact top row ---- */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {s.student?.name ?? "Student"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted {new Date(s.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <Badge variant={s.status === "GRADED" ? "default" : "secondary"}>
                    {s.status}
                  </Badge>

                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <a href={s.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      File
                    </a>
                  </Button>

                  {/* grade controls */}
                  {showEditor ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        placeholder="0-100"
                        value={grades[s.id] ?? (s.grade != null ? String(s.grade) : "")}
                        onChange={(e) =>
                          setGrades((g) => ({ ...g, [s.id]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => handleGrade(s)}
                        disabled={savingId === s.id}
                      >
                        {savingId === s.id ? "Saving..." : "Save grade"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Grade: {s.grade}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setEditingId(s.id)}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit Grade
                      </Button>
                    </div>
                  )}
                </div>

                {/* student's note */}
                {s.note && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Note: </span>
                    {s.note}
                  </p>
                )}

                {/* feedback: multi-line editor when editing, read-only otherwise */}
                {showEditor ? (
                  <div className="mt-2 space-y-1">
                    <label className="text-xs font-medium">Feedback</label>
                    <Textarea
                      rows={2}
                      placeholder="Optional feedback for the student"
                      value={feedbacks[s.id] ?? s.feedback ?? ""}
                      onChange={(e) =>
                        setFeedbacks((f) => ({ ...f, [s.id]: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  s.feedback && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Feedback:{" "}
                      </span>
                      {s.feedback}
                    </p>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
