import apiClient from "@/lib/api-client"

export interface RegisterProfileRequest {
  name: string
  phone: string
  email: string
  address: string
  password: string
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
  message: string
}

export interface VerifyRegistrationResponse {
  success: boolean
  data: RegisteredUser
}

export const userService = {
  async registerProfile(data: RegisterProfileRequest): Promise<RegisterProfileResponse> {
    const response = await apiClient.post<RegisterProfileResponse>("/users/register", data)
    return response.data
  },

  async verifyRegistration(email: string, otp: string): Promise<VerifyRegistrationResponse> {
    const response = await apiClient.post<VerifyRegistrationResponse>("/users/register/verify", { email, otp })
    return response.data
  },
}

export type AdminRole = "user" | "admin"
export type SubscriptionStatus = "active" | "expired" | "inactive"

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  registration_date: string
  subscription_status: SubscriptionStatus
  subscription_start_date: string | null
  subscription_expiry_date: string | null
}

export interface AdminAuditEntry {
  id?: number | string
  action: string
  admin_name?: string
  target_user_name?: string
  created_at: string
  note?: string | null
}

export interface AdminUsersQuery {
  q: string
  limit: number
  offset: number
}

export interface AdminUsersPagination {
  limit: number
  offset: number
  total: number
  has_more: boolean
}

export interface AdminUsersResponse {
  users: AdminUser[]
  pagination: AdminUsersPagination
}

type AdminUsersPayload = {
  users?: AdminUser[]
  data?: AdminUser[]
  pagination?: Partial<AdminUsersPagination>
  limit?: number
  offset?: number
  total?: number
  has_more?: boolean
}

function unwrapList<T>(payload: T[] | { data?: T[]; users?: T[] }): T[] {
  if (Array.isArray(payload)) return payload
  return payload.users ?? payload.data ?? []
}

export const adminService = {
  async getUsers({ q, limit, offset }: AdminUsersQuery): Promise<AdminUsersResponse> {
    const response = await apiClient.get<AdminUsersPayload | AdminUser[]>("/admin/users", {
      params: { q, limit, offset },
    })
    const payload = response.data
    const users = unwrapList(payload)
    const pagination = Array.isArray(payload) ? undefined : payload.pagination
    return {
      users,
      pagination: {
        limit: pagination?.limit ?? (!Array.isArray(payload) ? payload.limit : undefined) ?? limit,
        offset: pagination?.offset ?? (!Array.isArray(payload) ? payload.offset : undefined) ?? offset,
        total: pagination?.total ?? (!Array.isArray(payload) ? payload.total : undefined) ?? users.length,
        has_more: pagination?.has_more ?? (!Array.isArray(payload) ? payload.has_more : undefined) ?? false,
      },
    }
  },

  async getAudit(): Promise<AdminAuditEntry[]> {
    const response = await apiClient.get<AdminAuditEntry[] | { data?: AdminAuditEntry[] }>("/admin/audit")
    return unwrapList(response.data)
  },

  async subscriptionAction(userId: number, action: "activate" | "extend" | "expire", note?: string) {
    await apiClient.post(`/admin/users/${userId}/subscription/${action}`, note ? { note } : undefined)
  },

  async changeRole(userId: number, role: AdminRole) {
    await apiClient.patch(`/admin/users/${userId}/role`, { role })
  },
}
