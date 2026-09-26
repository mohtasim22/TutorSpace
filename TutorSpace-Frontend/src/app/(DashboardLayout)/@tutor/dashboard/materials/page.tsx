// @tutor/dashboard/materials/page.tsx

import TutorMaterialsPage from "@/components/modules/materials/TutorMaterialsPage"
import { getMaterials } from "@/services/materials"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"
import { getAllCoursesByTutorId } from "@/services/course"

export default async function TutorMaterialsRoute() {
  const user = await getUser()
  const { tutor } = await getTutorProfile({ userId: user?.id })

  const [materials, courses] = await Promise.all([
    getMaterials(),
    getAllCoursesByTutorId(tutor?.id),
  ])

  return (
    <TutorMaterialsPage materials={materials ?? []} courses={courses ?? []} />
  )
}
