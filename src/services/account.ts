import apiClient from "@/lib/api-client"

export const accountService = {
  async exportData(): Promise<unknown> {
    const response = await apiClient.get<unknown>("/account/export-data")
    return response.data
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete("/account", { data: { confirmation: "DELETE MY ACCOUNT" } })
  },
}
