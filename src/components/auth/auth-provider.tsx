"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { authService } from "@/services/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    hydrate()
    const { accessToken } = useAuthStore.getState()
    if (!accessToken) return
    authService.getMe().then(setUser).catch(() => logout())
  }, [hydrate, logout, setUser])

  return <>{children}</>
}
