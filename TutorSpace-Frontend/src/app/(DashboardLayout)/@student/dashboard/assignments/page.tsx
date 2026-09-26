// @student/dashboard/assignments/page.tsx

import StudentAssignmentsPage from "@/components/modules/assignments/StudentAssignmentsPage"
import { getAssignments } from "@/services/assignments"

export default async function StudentAssignmentsRoute() {
  const assignments = await getAssignments()
  return <StudentAssignmentsPage assignments={assignments ?? []} />
}
