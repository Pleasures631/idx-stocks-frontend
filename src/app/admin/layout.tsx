"use client"

import { useAuthStore } from "@/stores/auth-store"
import { ShieldAlert } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isHydrated, pathname, router])

  if (!isHydrated || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking session...</div>
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <section className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-amber-500" aria-hidden="true" />
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">You do not have permission to view this area.</p>
          <button className="mt-6 rounded-md border px-4 py-2 text-sm hover:bg-muted" onClick={() => router.replace("/dashboard")}>
            Return to dashboard
          </button>
        </section>
      </main>
    )
  }

  return <>{children}</>
}
