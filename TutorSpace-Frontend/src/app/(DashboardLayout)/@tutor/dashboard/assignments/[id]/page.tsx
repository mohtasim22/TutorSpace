// @tutor/dashboard/assignments/[id]/page.tsx

import TutorAssignmentDetail from "@/components/modules/assignments/TutorAssignmentDetail"
import { getAssignmentById } from "@/services/assignments"

export default async function TutorAssignmentDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const assignment = await getAssignmentById(id)

  return <TutorAssignmentDetail assignment={assignment} />
}
