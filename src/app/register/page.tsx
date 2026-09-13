import { RegisterForm } from "@/components/auth/register-form"
import { SiteFooter } from "@/components/layout/site-footer"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <RegisterForm />
      <SiteFooter />
    </div>
  )
}
