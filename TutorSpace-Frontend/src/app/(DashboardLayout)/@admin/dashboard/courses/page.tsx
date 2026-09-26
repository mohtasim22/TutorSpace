import AdminCoursesPage from "@/components/modules/admin/AdminCoursesPage"
import { getAllAdminCourses } from "@/services/admin"

export default async function CoursesPage() {
  const {courses} = await getAllAdminCourses()
  
  return <AdminCoursesPage initialCourses={courses ?? []} />
}