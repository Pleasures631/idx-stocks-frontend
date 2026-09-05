import apiClient from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from "@/types"

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth/register", data)
    return response.data
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<{ user: AuthUser }>("/api/auth/me")
    return response.data.user
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth/refresh", {
      refresh_token: refreshToken,
    })
    return response.data
  },
}
