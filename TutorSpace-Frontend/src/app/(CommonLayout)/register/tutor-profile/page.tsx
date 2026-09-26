// app/(CommonLayout)/register/tutor-profile/page.tsx
import TutorProfileSetupForm from "@/components/modules/auth/register/TutorProfileSetupForm"
import { Suspense } from "react"

export default function TutorProfileSetupPage() {
  return (
    <Suspense fallback={null}>
      <TutorProfileSetupForm />
    </Suspense>
  )
}