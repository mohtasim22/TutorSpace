"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { Sparkles, Trash2, Send, Undo2, ChevronDown, ChevronUp } from "lucide-react"
import { updatePracticeSet, deletePracticeSet } from "@/services/practice"
import QuestionList from "./QuestionList"
import type { PracticeSet } from "./types"

/**
 * The tutor's view of generated practice sets.
 *
 * A set arrives here unpublished. Publishing is an explicit action the tutor
 * takes after reading the questions — the model's output does not reach a
 * student on its own. Unpublishing is available too, so a set can be pulled
 * back if a mistake gets through.
 */
export default function TutorPracticePage({ sets }: { sets: PracticeSet[] }) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(sets[0]?.id ?? null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [titleDraft, setTitleDraft] = useState<Record<string, string>>({})

  const handlePublishToggle = async (set: PracticeSet) => {
    try {
      setBusyId(set.id)
      const res = await updatePracticeSet(set.id, {
        is_published: !set.is_published,
      })
      if (res?.status === "success") {
        toast.success(set.is_published ? "Unpublished" : "Published to your students")
        router.refresh()
      } else {
        toast.error(res?.message || "Could not update the set")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBusyId(null)
    }
  }

  const handleRename = async (set: PracticeSet) => {
    const next = (titleDraft[set.id] ?? "").trim()
    if (!next || next === set.title) return
    try {
      setBusyId(set.id)
      const res = await updatePracticeSet(set.id, { title: next })
      if (res?.status === "success") {
        toast.success("Title updated")
        router.refresh()
      } else {
        toast.error(res?.message || "Could not rename the set")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setBusyId(id)
      const res = await deletePracticeSet(id)
      if (res?.status === "success") {
        toast.success("Practice set deleted")
        router.refresh()
      } else {
        toast.error(res?.message || "Could not delete the set")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Practice Questions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sets you generated for your courses. Read them through before
          publishing: students only see a set once you publish it. Students
          can also generate their own private quizzes, which are not listed
          here.
        </p>
      </div>

      {sets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No practice sets yet. Open Course Materials and use{" "}
            <span className="font-medium">Quiz for the course</span> on any
            PDF to generate one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => {
            const isOpen = openId === set.id
            return (
              <Card key={set.id}>
                <CardContent className="py-4 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{set.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline">
                          {set.course?.name ?? "Course"}
                        </Badge>
                        <Badge
                          variant={set.is_published ? "default" : "secondary"}
                        >
                          {set.is_published ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {set.questions?.length ?? 0} questions
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={() => setOpenId(isOpen ? null : set.id)}
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Review
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant={set.is_published ? "outline" : "default"}
                      className="gap-1"
                      disabled={busyId === set.id}
                      onClick={() => handlePublishToggle(set)}
                    >
                      {set.is_published ? (
                        <>
                          <Undo2 className="h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Publish
                        </>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive"
                          disabled={busyId === set.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this practice set?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            &ldquo;{set.title}&rdquo; will be removed for good.
                            If it is published, your students will lose access
                            to it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(set.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {isOpen && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="space-y-1 pt-3">
                        <label className="text-sm font-medium">Title</label>
                        <div className="flex gap-2">
                          <Input
                            value={titleDraft[set.id] ?? set.title}
                            onChange={(e) =>
                              setTitleDraft((prev) => ({
                                ...prev,
                                [set.id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            variant="outline"
                            disabled={busyId === set.id}
                            onClick={() => handleRename(set)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>

                      <QuestionList questions={set.questions ?? []} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
