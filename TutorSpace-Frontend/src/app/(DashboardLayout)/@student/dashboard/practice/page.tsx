// @student/dashboard/practice/page.tsx

import StudentPracticePage from "@/components/modules/practice/StudentPracticePage"
import { getPracticeSets } from "@/services/practice"

export default async function StudentPracticeRoute() {
  const sets = await getPracticeSets()
  return <StudentPracticePage sets={sets ?? []} />
}
