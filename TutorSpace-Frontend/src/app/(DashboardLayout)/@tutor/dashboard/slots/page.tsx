// @tutor/dashboard/slots/page.tsx
import TutorSlotsPage from "@/components/modules/courseSlots/TutorSlotsPage"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"
import { getAllCoursesByTutorId } from "@/services/course"
import { getSlotByTutor } from "@/services/courseSlots"

export default async function TutorSlotsRoute() {
  const user = await getUser()
  const { tutor } = await getTutorProfile({ userId: user?.id })

  const [slotsRes, courses] = await Promise.all([
    getSlotByTutor(tutor?.id),      // your existing service
    getAllCoursesByTutorId(tutor?.id),    // your existing service
  ])
  

  return <TutorSlotsPage initialSlots={slotsRes?.slots ?? []} courses={courses ?? []} />
}