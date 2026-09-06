"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService } from "@/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandMark } from "@/components/brand/brand-mark"

const schema = z.object({ password: z.string().min(8, "Password must be at least 8 characters").max(72), confirmPassword: z.string() }).refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })
type FormData = z.infer<typeof schema>

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") || ""
  const router = useRouter(); const [error, setError] = useState(""); const [done, setDone] = useState(false)
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { password: "", confirmPassword: "" } })
  const onSubmit = async (data: FormData) => { setError(""); try { await authService.resetPassword(token, data.password); setDone(true); setTimeout(() => router.push("/login"), 1200) } catch { setError("This reset link is invalid or expired.") } }
  return <Card className="w-full max-w-sm"><CardHeader className="text-center"><BrandMark className="mx-auto mb-2 h-12 w-48 object-contain" /><CardTitle>Reset password</CardTitle><CardDescription>Choose a new password for your account.</CardDescription></CardHeader><CardContent>{done ? <p className="text-sm">Password updated. Redirecting to sign in...</p> : <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    {!token && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">Reset token is missing.</div>}{error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
    <div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" {...form.register("password")} className="h-11" />{form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" type="password" {...form.register("confirmPassword")} className="h-11" />{form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}</div>
    <Button type="submit" className="w-full h-11" disabled={!token}>Update password</Button>
  </form>}</CardContent></Card>
}
