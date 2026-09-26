// @tutor/dashboard/courses/page.tsx
import TutorCoursesPage from "@/components/modules/courses/CreateCourseForm"
import { getAllCoursesByTutorId } from "@/services/course"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"

export default async function CoursesPage() {
  const user = await getUser()
  const { tutor } = await getTutorProfile({ userId: user?.id })
  const courses = await getAllCoursesByTutorId(tutor?.id)
  return <TutorCoursesPage initialCourses={courses ?? []} />
}