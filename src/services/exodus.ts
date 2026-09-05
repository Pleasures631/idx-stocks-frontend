import apiClient from "@/lib/api-client"
import type { ExodusBrokerSummaryDB, ExodusFlowPhase } from "@/types"

export const exodusService = {
  async getBrokerSummary(params: {
    symbol: string
    from: string
    to: string
  }): Promise<ExodusBrokerSummaryDB[]> {
    const response = await apiClient.get<ExodusBrokerSummaryDB[]>("/exodus/broker-summary", {
      params,
    })
    return response.data
  },

  async fetchBrokerSummary(data: {
    symbol: string
    from: string
    to: string
  }): Promise<{ message: string }> {
    const response = await apiClient.post("/exodus/broker-summary/fetch", data)
    return response.data
  },

  async bulkFetch(): Promise<{ message: string }> {
    const response = await apiClient.post("/exodus/broker-summary/bulkfetch")
    return response.data
  },

  async analyzeFlow(params: {
    symbol: string
    from: string
    to: string
  }): Promise<ExodusFlowPhase> {
    const response = await apiClient.get<ExodusFlowPhase>("/exodus/broker-summary/analyze-flow", {
      params,
    })
    return response.data
  },
}
