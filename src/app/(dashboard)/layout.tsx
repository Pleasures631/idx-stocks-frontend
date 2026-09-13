"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { useAuthStore } from "@/stores/auth-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isHydrated } = useAuthStore()

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [isAuthenticated, isHydrated, pathname, router])

  if (!isHydrated || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking session...</div>
  }

  return <AppLayout>{children}</AppLayout>
}
