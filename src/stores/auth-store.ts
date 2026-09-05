import { create } from "zustand"
import type { AuthUser } from "@/types"

type StorageAdapter = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function getStorage(rememberMe: boolean): StorageAdapter {
  if (typeof window === "undefined") {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }
  return rememberMe ? localStorage : sessionStorage
}

function readPersistedTokens(): {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
} {
  if (typeof window === "undefined") return { user: null, accessToken: null, refreshToken: null }

  for (const storage of [localStorage, sessionStorage]) {
    const accessToken = storage.getItem("access_token")
    const refreshToken = storage.getItem("refresh_token")
    const userStr = storage.getItem("auth_user")
    if (accessToken && refreshToken && userStr) {
      try {
        return { user: JSON.parse(userStr), accessToken, refreshToken }
      } catch {
        storage.removeItem("access_token")
        storage.removeItem("refresh_token")
        storage.removeItem("auth_user")
      }
    }
  }
  return { user: null, accessToken: null, refreshToken: null }
}

function persistTokens(user: AuthUser, accessToken: string, refreshToken: string, rememberMe: boolean) {
  const storage = getStorage(rememberMe)
  storage.setItem("access_token", accessToken)
  storage.setItem("refresh_token", refreshToken)
  storage.setItem("auth_user", JSON.stringify(user))
}

function clearPersistedTokens() {
  if (typeof window === "undefined") return
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem("access_token")
    storage.removeItem("refresh_token")
    storage.removeItem("auth_user")
  }
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string, rememberMe?: boolean) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken, refreshToken, rememberMe = false) => {
    persistTokens(user, accessToken, refreshToken, rememberMe)
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken })
  },

  setUser: (user) => {
    set({ user })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  logout: () => {
    clearPersistedTokens()
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },

  hydrate: () => {
    const { user, accessToken, refreshToken } = readPersistedTokens()
    if (accessToken && refreshToken && user) {
      set({ user, accessToken, refreshToken, isAuthenticated: true })
    }
  },
}))
