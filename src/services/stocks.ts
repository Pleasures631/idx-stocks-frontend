import apiClient from "@/lib/api-client"
import type { StockListItem, BrokerListItem, TickerDetail, PriceChartRange, StockAnalyze, StockbitIHSGQuote, StockbitForeignDomestic, StockbitIHSGChartPoint } from "@/types"

export interface TickerDetailParams {
  range?: PriceChartRange
  from?: string
  to?: string
}

export const stocksService = {
  async getIHSGQuote(): Promise<StockbitIHSGQuote> {
    const response = await apiClient.get<{ success: boolean; data: StockbitIHSGQuote }>(
      "/market/ihsg",
      { skipLoading: true }
    )
    return response.data.data
  },

  async getIHSGForeignDomestic(): Promise<StockbitForeignDomestic[]> {
    const response = await apiClient.get<{ success: boolean; data: StockbitForeignDomestic[] }>(
      "/market/ihsg/foreign-domestic",
      { skipLoading: true }
    )
    return response.data.data
  },

  async getIHSGChart(from: string, to: string): Promise<StockbitIHSGChartPoint[]> {
    const response = await apiClient.get<{ success: boolean; data: StockbitIHSGChartPoint[] }>(
      "/market/ihsg/chart",
      { params: { symbol: "IHSG", from, to }, skipLoading: true }
    )
    return response.data.data
  },

  async getStockList(): Promise<StockListItem[]> {
    const response = await apiClient.get<{ success: boolean; total: number; data: StockListItem[] }>(
      "/stocks/list",
      { skipLoading: true }
    )
    return response.data.data
  },

  async getTickerDetail(symbol: string, params?: TickerDetailParams): Promise<TickerDetail> {
    const response = await apiClient.get<{ success: boolean; data: TickerDetail }>(
      `/stocks/${symbol}`,
      { params, skipLoading: true }
    )
    return response.data.data
  },

  async getStockAnalyze(symbol: string): Promise<StockAnalyze> {
    const response = await apiClient.get<{ success: boolean; data: StockAnalyze }>(
      `/stocks/${symbol}/analyze`,
      { skipLoading: true }
    )
    return response.data.data
  },

  async getBrokerList(): Promise<BrokerListItem[]> {
    const response = await apiClient.get<{ success: boolean; total: number; data: BrokerListItem[] }>(
      "/brokers/list",
      { skipLoading: true }
    )
    return response.data.data
  },
}
