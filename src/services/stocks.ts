import apiClient from "@/lib/api-client"
import type {
  TradingSummaryResponse,
  TopAccumulation,
  TopAccumulationEod,
  SilentAccumulation,
  TopSwinger,
  StatisticSingleStock,
  BacktestResponse,
  BrokerSummaryResponse,
  BacktestRunRequest,
  BacktestRunResponse,
  StockListItem,
  BrokerListItem,
} from "@/types"

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


  async getTradingSummary(params?: { date?: string; stock_code?: string }) {
    const response = await apiClient.get<TradingSummaryResponse>("/tradingsummary/insert", { params })
    return response.data
  },

  async getTopAccumulation(): Promise<TopAccumulation[]> {
    const response = await apiClient.get<TopAccumulation[]>("/analyze/top-accumulation")
    return response.data
  },

  async getTopAccumulationEod(): Promise<TopAccumulationEod[]> {
    const response = await apiClient.get<TopAccumulationEod[]>("/analyze/top-accumulation-eod")
    return response.data
  },

  async getSilentAccumulation(): Promise<SilentAccumulation[]> {
    const response = await apiClient.get<SilentAccumulation[]>("/analyze/silent-accumulation")
    return response.data
  },

  async getTopScalping(): Promise<TopSwinger[]> {
    const response = await apiClient.get<TopSwinger[]>("/analyze/top-scalping-daily")
    return response.data
  },

  async getSingleStock(stockCode: string): Promise<StatisticSingleStock> {
    const response = await apiClient.get<StatisticSingleStock>("/analyze/single-stocks", {
      params: { stock_code: stockCode },
    })
    return response.data
  },

  async getBacktestEod(date?: string): Promise<BacktestResponse> {
    const response = await apiClient.get<BacktestResponse>("/backtest/top-accumulation-eod", {
      params: { date },
    })
    return response.data
  },

  async runBacktest(data: BacktestRunRequest): Promise<BacktestRunResponse> {
    const response = await apiClient.post<BacktestRunResponse>("/api/v1/backtest/run", data)
    return response.data
  },

  async getBrokerSummary(date: string): Promise<BrokerSummaryResponse> {
    const response = await apiClient.get<BrokerSummaryResponse>("/idx/brokersummary", {
      params: { date },
    })
    return response.data
  },

  async analyzeBrokerSummary(params: { from: string; to: string }): Promise<BrokerSummaryResponse> {
    const response = await apiClient.get<BrokerSummaryResponse>("/idx/brokersummary/analyze", {
      params,
    })
    return response.data
  },
}
