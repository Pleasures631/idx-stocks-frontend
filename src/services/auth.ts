import apiClient from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthResponse, AuthMeResponse, AuthUser } from "@/types"

type AuthMePayload = AuthMeResponse | { success: boolean; data: AuthUser }

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data, { skipAuthRefresh: true })
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/users/register", data)
    return response.data
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<AuthMePayload>("/auth/me")
    const payload = response.data
    const user = "data" in payload ? payload.data : payload.user
    const subscription = "data" in payload ? undefined : payload.subscription
    const access = "data" in payload ? undefined : payload.access
    if (!user) throw new Error("Invalid /auth/me response")
    return { ...user, subscription: subscription ?? user.subscription, access: access ?? user.access }
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    })
    return response.data
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, password })
  },
}
