"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/lib/validators"
import { userService } from "@/services/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import axios from "axios"
import { BrandMark } from "@/components/brand/brand-mark"

export function RegisterForm() {
  const [error, setError] = useState("")
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [verificationEmail, setVerificationEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [termsRead, setTermsRead] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const termsRef = useRef<HTMLDivElement>(null)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", email: "", address: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) return
    setLoading(true)
    setError("")
    try {
      const result = await userService.registerProfile(data)
      if (result.success) {
        setVerificationEmail(data.email)
      }
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const response = requestError.response
        const validationErrors = response?.data?.validation_errors as Record<string, string> | undefined
        if (validationErrors) {
          for (const [field, message] of Object.entries(validationErrors)) {
            if (field in form.getValues()) {
              form.setError(field as keyof RegisterFormData, { message })
            }
          }
        }
        setError(response?.data?.message || "Registration failed")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const onVerify = async (event: FormEvent) => {
    event.preventDefault()
    setVerifying(true)
    setVerificationError("")
    try {
      const result = await userService.verifyRegistration(verificationEmail, otp)
      if (result.success) setRegisteredEmail(result.data.email)
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) setVerificationError(requestError.response?.data?.message || "Verification failed")
      else setVerificationError("Verification failed. Please try again.")
    } finally { setVerifying(false) }
  }

  if (registeredEmail) {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader className="text-center">
          <BrandMark className="mx-auto mb-2 h-12 w-48 object-contain" />
          <CardTitle className="text-2xl">Registration complete</CardTitle>
          <CardDescription>
            Your profile for <span className="font-medium text-foreground">{registeredEmail}</span> has been saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="h-11 w-full">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (verificationEmail) {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <BrandMark className="mx-auto mb-2 h-12 w-48 object-contain" />
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>We sent a 6-digit code to <span className="font-medium text-foreground">{verificationEmail}</span>.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onVerify} className="space-y-4">
            {verificationError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{verificationError}</div>}
            <div className="space-y-2"><Label htmlFor="otp">Verification code</Label><Input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="h-12 text-center text-xl tracking-[0.5em]" /></div>
            <Button type="submit" className="h-11 w-full" disabled={verifying || otp.length !== 6}>{verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify email"}</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setVerificationEmail(""); setOtp(""); }}>Back to registration</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <BrandMark className="mx-auto mb-2 h-12 w-48 object-contain" />
        <CardTitle className="text-2xl">Create your profile</CardTitle>
        <CardDescription>Register with your contact details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Budi Santoso" {...form.register("name")} className="h-11" />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" placeholder="081234567890" {...form.register("phone")} className="h-11" />
            {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} className="h-11" />
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              placeholder="Jl. Sudirman No. 10, Jakarta"
              {...form.register("address")}
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="At least 8 characters" {...form.register("password")} className="h-11" />
            {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} className="h-11" />
            {form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
          </div>
          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium">Syarat & Ketentuan</p>
            <div
              ref={termsRef}
              onScroll={(event) => {
                const element = event.currentTarget
                if (element.scrollTop + element.clientHeight >= element.scrollHeight - 2) setTermsRead(true)
              }}
              tabIndex={0}
              role="region"
              aria-label="Syarat dan Ketentuan Yapping Saham"
              className="h-32 overflow-y-auto rounded border bg-background p-3 text-xs leading-5 text-muted-foreground"
            >
              <p className="font-medium text-foreground">Dengan menggunakan Yapping Saham, Anda menyetujui bahwa:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Layanan digunakan secara sah dan Anda menjaga keamanan akun sendiri.</li>
                <li>Data pasar dapat tertunda, tidak lengkap, atau memiliki kesalahan.</li>
                <li>Informasi bukan nasihat investasi, instruksi beli/jual, atau jaminan keuntungan.</li>
                <li>Aktivasi manual berlaku selama periode yang disetujui, termasuk 30 hari bila dinyatakan.</li>
                <li>Ketentuan lengkap tersedia di halaman <Link href="/terms" className="text-foreground underline">Syarat & Ketentuan</Link>.</li>
              </ul>
              <p className="mt-2">Gulir sampai akhir untuk mengaktifkan persetujuan.</p>
            </div>
            <label className={`flex items-start gap-2 text-sm ${termsRead ? "cursor-pointer" : "cursor-not-allowed text-muted-foreground"}`}>
              <input
                type="checkbox"
                checked={termsAccepted}
                disabled={!termsRead}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                aria-label="Saya menyetujui Syarat & Ketentuan"
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>Saya telah membaca dan menyetujui Syarat & Ketentuan.</span>
            </label>
            {!termsRead && <p className="text-xs text-amber-600 dark:text-amber-400">Baca dan gulir sampai bawah sebelum mencentang persetujuan.</p>}
            {termsRead && !termsAccepted && <p className="text-xs text-destructive">Persetujuan Syarat & Ketentuan wajib untuk mendaftar.</p>}
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading || !termsAccepted}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving profile...</> : "Create profile"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-foreground underline hover:no-underline">Sign in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
