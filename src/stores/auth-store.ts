import { create } from "zustand"
import type { AuthUser } from "@/types"

type StorageAdapter = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

type PersistedSession = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

const ACTIVE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  user: "auth_user",
  rememberMe: "auth_remember_me",
} as const
const REMEMBERED_SESSIONS_KEY = "remembered_auth_sessions"
const LAST_REMEMBERED_USER_KEY = "remembered_auth_last_user"

function emptyStorage(): StorageAdapter {
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
}

function getSessionStorage(): StorageAdapter {
  return typeof window === "undefined" ? emptyStorage() : window.sessionStorage
}

function readActiveSession(): PersistedSession | null {
  const storage = getSessionStorage()
  const accessToken = storage.getItem(ACTIVE_KEYS.accessToken)
  const refreshToken = storage.getItem(ACTIVE_KEYS.refreshToken)
  const userStr = storage.getItem(ACTIVE_KEYS.user)
  if (!accessToken || !refreshToken || !userStr) return null
  try {
    const user = JSON.parse(userStr) as AuthUser
    return { user, accessToken, refreshToken }
  } catch {
    clearActiveSession()
    return null
  }
}

function readRememberedSession(): PersistedSession | null {
  if (typeof window === "undefined") return null
  const lastUserId = window.localStorage.getItem(LAST_REMEMBERED_USER_KEY)
  if (!lastUserId) return null
  try {
    const sessions = JSON.parse(window.localStorage.getItem(REMEMBERED_SESSIONS_KEY) || "{}") as Record<string, PersistedSession>
    return sessions[lastUserId] || null
  } catch {
    window.localStorage.removeItem(REMEMBERED_SESSIONS_KEY)
    window.localStorage.removeItem(LAST_REMEMBERED_USER_KEY)
    return null
  }
}

function writeActiveSession(session: PersistedSession, rememberMe: boolean) {
  const storage = getSessionStorage()
  storage.setItem(ACTIVE_KEYS.accessToken, session.accessToken)
  storage.setItem(ACTIVE_KEYS.refreshToken, session.refreshToken)
  storage.setItem(ACTIVE_KEYS.user, JSON.stringify(session.user))
  storage.setItem(ACTIVE_KEYS.rememberMe, String(rememberMe))
}

function writeRememberedSession(session: PersistedSession) {
  if (typeof window === "undefined") return
  try {
    const sessions = JSON.parse(window.localStorage.getItem(REMEMBERED_SESSIONS_KEY) || "{}") as Record<string, PersistedSession>
    const userKey = String(session.user.id)
    sessions[userKey] = session
    window.localStorage.setItem(REMEMBERED_SESSIONS_KEY, JSON.stringify(sessions))
    window.localStorage.setItem(LAST_REMEMBERED_USER_KEY, userKey)
  } catch {
    // Storage can be unavailable or full; the tab session remains usable.
  }
}

function removeRememberedSession(userId: number | null) {
  if (typeof window === "undefined" || userId === null) return
  try {
    const sessions = JSON.parse(window.localStorage.getItem(REMEMBERED_SESSIONS_KEY) || "{}") as Record<string, PersistedSession>
    delete sessions[String(userId)]
    window.localStorage.setItem(REMEMBERED_SESSIONS_KEY, JSON.stringify(sessions))
    if (window.localStorage.getItem(LAST_REMEMBERED_USER_KEY) === String(userId)) {
      const nextUserId = Object.keys(sessions)[0]
      if (nextUserId) window.localStorage.setItem(LAST_REMEMBERED_USER_KEY, nextUserId)
      else window.localStorage.removeItem(LAST_REMEMBERED_USER_KEY)
    }
  } catch {
    // Best effort cleanup.
  }
}

function clearActiveSession() {
  const storage = getSessionStorage()
  storage.removeItem(ACTIVE_KEYS.accessToken)
  storage.removeItem(ACTIVE_KEYS.refreshToken)
  storage.removeItem(ACTIVE_KEYS.user)
  storage.removeItem(ACTIVE_KEYS.rememberMe)
}

function persistRefreshedTokens(accessToken: string, refreshToken: string) {
  const storage = getSessionStorage()
  storage.setItem(ACTIVE_KEYS.accessToken, accessToken)
  storage.setItem(ACTIVE_KEYS.refreshToken, refreshToken)
  if (storage.getItem(ACTIVE_KEYS.rememberMe) !== "true") return
  const userStr = storage.getItem(ACTIVE_KEYS.user)
  if (!userStr) return
  try {
    const user = JSON.parse(userStr) as AuthUser
    writeRememberedSession({ user, accessToken, refreshToken })
  } catch {
    clearActiveSession()
  }
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
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
  isHydrated: false,

  setAuth: (user, accessToken, refreshToken, rememberMe = false) => {
    const session = { user, accessToken, refreshToken }
    writeActiveSession(session, rememberMe)
    if (rememberMe) writeRememberedSession(session)
    else removeRememberedSession(user.id)
    set({ ...session, isAuthenticated: true, isHydrated: true })
  },

  setTokens: (accessToken, refreshToken) => {
    persistRefreshedTokens(accessToken, refreshToken)
    set({ accessToken, refreshToken })
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    const currentUser = useAuthStore.getState().user
    clearActiveSession()
    removeRememberedSession(currentUser?.id ?? null)
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  hydrate: () => {
    const session = readActiveSession() || readRememberedSession()
    if (session) {
      const remembered = !readActiveSession() && typeof window !== "undefined"
      writeActiveSession(session, remembered)
      set({ ...session, isAuthenticated: true, isHydrated: true })
      return
    }
    set({ isHydrated: true })
  },
}))
