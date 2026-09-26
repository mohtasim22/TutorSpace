// @student/dashboard/materials/page.tsx

import StudentMaterialsPage from "@/components/modules/materials/StudentMaterialsPage"
import { getMaterials } from "@/services/materials"

export default async function StudentMaterialsRoute() {
  const materials = await getMaterials()
  return <StudentMaterialsPage materials={materials ?? []} />
}
