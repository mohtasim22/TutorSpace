
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react"
import { createCourse, updateCourse, deleteCourse } from "@/services/course"

const schema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

type FormValues = z.infer<typeof schema>

type Course = {
  id: string
  name: string
  description: string
  status: string
  createdAt: string
}

export default function TutorCoursesPage({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  })

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  })

  // Create
  const onCreateSubmit = async (values: FormValues) => {
    try {
      setLoading("create")
      const res = await createCourse(values)
      if (res?.status === "success") {
        setCourses((prev) => [res.course, ...prev])
        toast.success("Course created!")
        form.reset()
        setCreateOpen(false)
      } else {
        toast.error(res?.message || "Failed to create course")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  // Open edit dialog
  const openEdit = (course: Course) => {
    setEditingCourse(course)
    editForm.reset({ name: course.name, description: course.description })
    setEditOpen(true)
  }

  // Edit
  const onEditSubmit = async (values: FormValues) => {
    if (!editingCourse) return
    try {
      setLoading("edit")
      const res = await updateCourse(editingCourse.id, values)
      if (res?.status === "success") {
        setCourses((prev) =>
          prev.map((c) => c.id === editingCourse.id ? { ...c, ...values } : c)
        )
        toast.success("Course updated!")
        setEditOpen(false)
        setEditingCourse(null)
      } else {
        toast.error(res?.message || "Failed to update course")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  // Delete
  const handleDelete = async (courseId: string) => {
    try {
      setLoading(courseId)
      const res = await deleteCourse(courseId)
      if (res?.status === "success") {
        setCourses((prev) => prev.filter((c) => c.id !== courseId))
        toast.success("Course deleted!")
      } else {
        toast.error(res?.message || "Failed to delete course")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  const CourseForm = ({ form, onSubmit, submitLabel }: {
    form: any
    onSubmit: (values: FormValues) => void
    submitLabel: string
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. CSE110 - Intro to Programming" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Describe what students will learn..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading === "create" || loading === "edit"}
        >
          {loading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  )

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your courses here.
          </p>
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new course for your students.
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              form={form}
              onSubmit={onCreateSubmit}
              submitLabel="Create Course"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update your course information here.
            </DialogDescription>
          </DialogHeader>
          <CourseForm
            form={editForm}
            onSubmit={onEditSubmit}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All Courses
            <Badge variant="outline" className="ml-auto">
              {courses.length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No courses yet. Create your first course!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{course.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {course.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(course)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              disabled={loading === course.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                {`Are you sure you want to delete "${course.name}"? All slots under this course will also be deleted.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(course.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}