"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Plus, Users, CalendarClock } from "lucide-react"
import { createAssignment } from "@/services/assignments"

type Course = { id: string; name: string }

type Assignment = {
  id: string
  title: string
  description: string
  due_date?: string | null
  course?: { name?: string }
  _count?: { submissions?: number }
}

interface Props {
  assignments: Assignment[]
  courses: Course[]
}

type FormValues = {
  title: string
  description: string
  due_date: string
  course_id: string
}

export default function TutorAssignmentsPage({ assignments, courses }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: { title: "", description: "", due_date: "", course_id: "" },
  })

  const onCreate = async (values: FormValues) => {
    if (!values.course_id) {
      toast.error("Please pick a course")
      return
    }
    try {
      setLoading(true)
      const res = await createAssignment({
        title: values.title,
        description: values.description,
        due_date: values.due_date || null,
        course_id: values.course_id,
      })
      if (res?.status === "success") {
        toast.success("Assignment created")
        setOpen(false)
        form.reset()
        router.refresh() // re-fetch the server component list
      } else {
        toast.error(res?.message || "Failed to create assignment")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Assignments
        </h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Assignment</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(onCreate)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  {...form.register("title", { required: true })}
                  placeholder="e.g. Week 1 Problem Set"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Course</label>
                <Select
                  onValueChange={(v) => form.setValue("course_id", v)}
                  value={form.watch("course_id")}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...form.register("description", { required: true })}
                  placeholder="What should students do?"
                  rows={4}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Due date (optional)</label>
                <Input type="date" {...form.register("due_date")} />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assignments yet. Create your first one above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => (
            <Link key={a.id} href={`/dashboard/assignments/${a.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {a.course?.name ?? "Course"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="line-clamp-2">{a.description}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {a._count?.submissions ?? 0} submissions
                    </span>
                    {a.due_date && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
