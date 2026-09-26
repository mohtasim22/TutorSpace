// app/(CommonLayout)/course-slots/page.tsx
import { getAllCourseSlots } from "@/services/courseSlots"
import CourseSlotsClient from "@/components/modules/courseSlots/CourseSlotsClient"
export const dynamic = "force-dynamic"
export default async function CourseSlotsPage() {
  const { slots } = await getAllCourseSlots()
  return <CourseSlotsClient slots={slots ?? []} />
}