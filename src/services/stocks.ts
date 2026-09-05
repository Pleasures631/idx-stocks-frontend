import apiClient from "@/lib/api-client"
import type { StockListItem, BrokerListItem } from "@/types"

export const stocksService = {
  async getStockList(): Promise<StockListItem[]> {
    const response = await apiClient.get<{ success: boolean; total: number; data: StockListItem[] }>(
      "/stocks/list",
      { headers: { "X-Skip-Loading": "true" } }
    )
    return response.data.data
  },

  async getBrokerList(): Promise<BrokerListItem[]> {
    const response = await apiClient.get<{ success: boolean; total: number; data: BrokerListItem[] }>(
      "/brokers/list",
      { headers: { "X-Skip-Loading": "true" } }
    )
    return response.data.data
  },
}