import axios from "axios"
import { useAuthStore } from "@/stores/auth-store"

declare module "axios" {
  export interface AxiosRequestConfig {
    skipLoading?: boolean
  }
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

let activeRequests = 0

apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState()

    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`
    }

    if (!config.skipLoading) {
      activeRequests++
      useAuthStore.getState().setLoading(true)
    }

    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1)
      if (activeRequests === 0) {
        useAuthStore.getState().setLoading(false)
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest.skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1)
      if (activeRequests === 0) {
        useAuthStore.getState().setLoading(false)
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${apiClient.defaults.baseURL}/api/auth/refresh`,
            { refresh_token: refreshToken }
          )
          const { access_token, refresh_token } = response.data
          useAuthStore.getState().setTokens(access_token, refresh_token)
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        } catch {
          useAuthStore.getState().logout()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }
      } else {
        useAuthStore.getState().logout()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
