"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/lib/validators"
import { userService } from "@/services/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import axios from "axios"

export function RegisterForm() {
  const [error, setError] = useState("")
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", email: "", address: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError("")
    try {
      const result = await userService.registerProfile(data)
      if (result.success) {
        setRegisteredEmail(result.data.email)
        form.reset()
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

  if (registeredEmail) {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader className="text-center">
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

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
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
          <Button type="submit" className="h-11 w-full" disabled={loading}>
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
