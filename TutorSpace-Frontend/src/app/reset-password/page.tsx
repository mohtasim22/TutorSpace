// app/reset-password/page.tsx
import { ResetPasswordForm } from "@/components/modules/auth/reset-password/ResetPasswordForm"
import { Suspense } from "react"

export const metadata = {
  title: "Reset Password | TutorSpace",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
