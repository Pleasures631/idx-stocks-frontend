import apiClient from "@/lib/api-client"
import type { ApiResponse, BrokerFlowBacktestRequest, BrokerFlowBacktestResponse } from "@/types"

export const brokerFlowBacktestService = {
  async run(request: BrokerFlowBacktestRequest): Promise<BrokerFlowBacktestResponse> {
    const response = await apiClient.post<ApiResponse<BrokerFlowBacktestResponse>>(
      "/api/v2/backtests/broker-flow",
      request,
      { skipLoading: true, timeout: 120_000 }
    )
    return response.data.data
  },
}
