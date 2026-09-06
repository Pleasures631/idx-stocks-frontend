import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
export default function ResetPasswordPage() { return <div className="flex min-h-screen items-center justify-center p-4"><Suspense fallback={<p>Loading...</p>}><ResetPasswordForm /></Suspense></div> }
