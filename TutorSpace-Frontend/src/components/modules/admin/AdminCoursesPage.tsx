"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BookOpen, Trash2 } from "lucide-react"
import { deleteCourse, updateCourseStatus } from "@/services/admin"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
  CardActions,
} from "@/components/shared/responsiveTable"

type Course = {
  id: string
  name: string
  description: string
  status: string
  tutor: { display_name: string }
  createdAt: string
}

export default function AdminCoursesPage({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusToggle = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      setLoading(courseId)
      const res = await updateCourseStatus(courseId, newStatus)
      if (res?.status === "success") {
        setCourses((prev) =>
          prev.map((c) => c.id === courseId ? { ...c, status: newStatus } : c)
        )
        toast.success("Course status updated")
      } else {
        toast.error(res?.message || "Failed to update status")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (courseId: string) => {
    try {
      setLoading(courseId)
      const res = await deleteCourse(courseId)
      if (res?.status === "success") {
        setCourses((prev) => prev.filter((c) => c.id !== courseId))
        toast.success("Course deleted")
      } else {
        toast.error(res?.message || "Failed to delete course")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  // Shared by the table and the mobile cards below, so the controls exist
  // once rather than in two copies that can drift apart.
  const renderActions = (course: any) => (
    <>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading === course.id}
                        onClick={() => handleStatusToggle(course.id, course.status)}
                        className={course.status === "ACTIVE"
                          ? "text-red-600 border-red-600 hover:bg-red-50"
                          : "text-green-600 border-green-600 hover:bg-green-50"
                        }
                      >
                        {course.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
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
                              {`Are you sure you want to delete "${course.name}"? This cannot be undone.`}
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
                  </>
  )

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Courses</h1>
        <Badge variant="outline">{courses.length} total</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableView>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No courses on the platform yet.
                  </TableCell>
                </TableRow>
              )}
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{course.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {course.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{course.tutor?.display_name}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(course.createdAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </TableCell>
                  <TableCell>{renderActions(course)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableView>

          {/* Phones: one card per row. These tables are five and six
              columns wide, so on a narrow screen the controls in the
              last column can only be reached by swiping. */}
          <CardView>
            {courses.map((course: any) => (
              <MobileCard key={course.id}>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{course.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {course.description}
                  </div>
                </div>
                <Field label="Tutor">{course.tutor?.display_name}</Field>
                <Field label="Status">
                  <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                </Field>
                <Field label="Created">
                  {new Date(course.createdAt).toLocaleDateString(undefined, {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </Field>
                <CardActions>{renderActions(course)}</CardActions>
              </MobileCard>
            ))}
            {courses.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing to show.
              </p>
            )}
          </CardView>
        </CardContent>
      </Card>
    </div>
  )
}