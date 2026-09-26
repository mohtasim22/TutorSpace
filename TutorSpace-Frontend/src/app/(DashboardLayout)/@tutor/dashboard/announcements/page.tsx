// @tutor/dashboard/announcements/page.tsx

import TutorAnnouncementsPage from "@/components/modules/announcements/TutorAnnouncementsPage"
import { getAnnouncements } from "@/services/announcements"
import { getUser } from "@/services/auth"
import { getTutorProfile } from "@/services/tutor"
import { getAllCoursesByTutorId } from "@/services/course"

export default async function TutorAnnouncementsRoute() {
  const user = await getUser()
  const { tutor } = await getTutorProfile({ userId: user?.id })

  const [announcements, courses] = await Promise.all([
    getAnnouncements(),
    getAllCoursesByTutorId(tutor?.id),
  ])

  return (
    <TutorAnnouncementsPage
      announcements={announcements ?? []}
      courses={courses ?? []}
    />
  )
}
