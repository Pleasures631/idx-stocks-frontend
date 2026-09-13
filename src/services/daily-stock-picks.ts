import apiClient from "@/lib/api-client"
import type { ApiResponse, DailyStockPicksData } from "@/types"

export const dailyStockPicksService = {
  async getDailyStockPicks(): Promise<DailyStockPicksData> {
    const response = await apiClient.get<ApiResponse<DailyStockPicksData>>(
      "/analyze/daily-stock-picks",
      { skipLoading: true }
    )
    if (!response.data.success || !response.data.data || !Array.isArray(response.data.data.picks)) {
      throw new Error("Invalid daily stock picks response")
    }
    return response.data.data
  },
}
