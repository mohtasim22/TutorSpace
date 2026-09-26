// @tutor/dashboard/practice/page.tsx

import TutorPracticePage from "@/components/modules/practice/TutorPracticePage"
import { getPracticeSets } from "@/services/practice"

export default async function TutorPracticeRoute() {
  const sets = await getPracticeSets()
  return <TutorPracticePage sets={sets ?? []} />
}
