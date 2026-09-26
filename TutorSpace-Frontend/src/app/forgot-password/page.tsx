// app/forgot-password/page.tsx
import { ForgotPasswordForm } from "@/components/modules/auth/forgot-password/ForgotPasswordForm"
import { Suspense } from "react"

export const metadata = {
  title: "Forgot Password | TutorSpace",
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
