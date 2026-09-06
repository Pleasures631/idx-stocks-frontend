import apiClient from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from "@/types"

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/users/register", data)
    return response.data
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<{ user: AuthUser }>("/auth/me")
    return response.data.user
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
