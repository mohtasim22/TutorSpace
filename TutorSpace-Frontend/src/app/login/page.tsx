// app/(CommonLayout)/login/page.tsx
import { LoginForm } from "@/components/modules/auth/login/loginFrom"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}