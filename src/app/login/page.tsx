import { LoginForm } from "@/components/auth/login-form"
import { Suspense } from "react"
import { SiteFooter } from "@/components/layout/site-footer"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="h-96" />}>
        <LoginForm />
      </Suspense>
      <SiteFooter />
    </div>
  )
}
