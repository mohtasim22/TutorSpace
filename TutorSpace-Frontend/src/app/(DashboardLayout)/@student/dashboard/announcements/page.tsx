// @student/dashboard/announcements/page.tsx

import StudentAnnouncementsPage from "@/components/modules/announcements/StudentAnnouncementsPage"
import { getAnnouncements } from "@/services/announcements"

export default async function StudentAnnouncementsRoute() {
  const announcements = await getAnnouncements()
  return <StudentAnnouncementsPage announcements={announcements ?? []} />
}
