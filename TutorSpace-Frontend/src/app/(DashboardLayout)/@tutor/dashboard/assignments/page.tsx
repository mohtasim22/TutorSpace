// @tutor/dashboard/assignments/page.tsx

import TutorAssignmentsPage from "@/components/modules/assignments/TutorAssignmentsPage"
import { getAssignments } from "@/services/assignments"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"
import { getAllCoursesByTutorId } from "@/services/course"

export default async function TutorAssignmentsRoute() {
  const user = await getUser()
  const { tutor } = await getTutorProfile({ userId: user?.id })

  const [assignments, courses] = await Promise.all([
    getAssignments(),
    getAllCoursesByTutorId(tutor?.id),
  ])

  return (
    <TutorAssignmentsPage
      assignments={assignments ?? []}
      courses={courses ?? []}
    />
  )
}
