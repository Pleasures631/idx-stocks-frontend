import apiClient from "@/lib/api-client"

export interface RegisterProfileRequest {
  name: string
  phone: string
  email: string
  address: string
}

export interface RegisteredUser {
  id: number
  name: string
  phone: string
  email: string
  address: string
  created_at: string
  updated_at: string
}

export interface RegisterProfileResponse {
  success: boolean
  data: RegisteredUser
}

export const userService = {
  async registerProfile(data: RegisterProfileRequest): Promise<RegisterProfileResponse> {
    const response = await apiClient.post<RegisterProfileResponse>("/users/register", data)
    return response.data
  },
}
