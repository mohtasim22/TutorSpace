// @admin/dashboard/tutors/page.tsx
import AdminTutorsPage from "@/components/modules/admin/AdminTutorsPage"
import { getAllTutors } from "@/services/tutor"


export default async function TutorsPage() {
  const { tutor } = await getAllTutors()
  return <AdminTutorsPage initialTutors={tutor ?? []} />
}