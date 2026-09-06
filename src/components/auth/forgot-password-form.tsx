"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService } from "@/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandMark } from "@/components/brand/brand-mark"

const schema = z.object({ email: z.string().email("Invalid email address") })
type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: "" } })
  const onSubmit = async (data: FormData) => {
    setError("")
    try { await authService.forgotPassword(data.email); setSubmitted(true) }
    catch { setError("Unable to request a reset link. Please try again.") }
  }
  return <Card className="w-full max-w-sm"><CardHeader className="text-center"><BrandMark className="mx-auto mb-2 h-12 w-48 object-contain" /><CardTitle>Forgot password</CardTitle><CardDescription>We&apos;ll send a reset link if the email is registered.</CardDescription></CardHeader><CardContent>
    {submitted ? <div className="space-y-4 text-sm"><p>Check your inbox for the password reset link.</p><Button asChild className="w-full"><Link href="/login">Back to sign in</Link></Button></div> : <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...form.register("email")} className="h-11" />{form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}</div>
      <Button type="submit" className="w-full h-11">Send reset link</Button><p className="text-center text-sm"><Link href="/login" className="underline">Back to sign in</Link></p>
    </form>}
  </CardContent></Card>
}
