// app/(CommonLayout)/tutors/page.tsx
import { getAllTutors } from "@/services/tutor"
import TutorsClient from "@/components/modules/tutors/TutorsClient"
export const dynamic = "force-dynamic"
export default async function TutorsPage() {
  const { tutor } = await getAllTutors()
  return <TutorsClient tutors={tutor ?? []} />
}