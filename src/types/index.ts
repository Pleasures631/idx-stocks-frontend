// ============================================================
// Types matching indonesia-stocks-api backend response shapes
// ============================================================

// --- Trading Summary ---
export interface TradingSummary {
  No: number
  IDStockSummary: number
  Date: string
  StockCode: string
  StockName: string
  Previous: number
  OpenPrice: number
  FirstTrade: number
  High: number
  Low: number
  Close: number
  Change: number
  Volume: number
  Value: number
  Frequency: number
  IndexIndividual: number
  Offer: number
  OfferVolume: number
  Bid: number
  BidVolume: number
  ListedShares: number
  TradebleShares: number
  WeightForIndex: number
  ForeignSell: number
  ForeignBuy: number
  DelistingDate: string
  NonRegularVolume: number
  NonRegularValue: number
  NonRegularFrequency: number
  persen: number | null
  percentage: number | null
}

export interface TradingSummaryResponse {
  draw: number
  recordsTotal: number
  recordsFiltered: number
  data: TradingSummary[]
}

// --- Broker Summary ---
export interface BrokerSummary {
  No: number
  IDBrokerSummary: number
  Date: string
  IDFirm: string
  FirmName: string
  Volume: number
  Value: number
  Frequency: number
}

export interface BrokerSummaryResponse {
  draw: number
  recordsTotal: number
  recordsFiltered: number
  data: BrokerSummary[]
}

// --- Stock List (for select/search) ---
export interface StockListItem {
  id: number
  stock_code: string
  stock_name: string
  listing_date: string
  total_shares: number
  listing_board: string
  is_active: boolean
  created_at: string
  last_trade_date: string
  last_price: number
  change_price: number
  change_pct: number
  volume: number
}

export interface StockbitIHSGQuote {
  symbol: string
  name: string
  price: string
  change: string
  change_pct: string
  as_of: string
  volume: string
  average_volume: string
  source_url: string
}

export interface StockbitIHSGChartPoint {
  symbol: string
  trade_date: string
  interval: string
  observed_at: string
  xlabel: string
  value: number
  percentage: number
  change: number
}

// --- Broker List ---
export interface BrokerListItem {
  broker_code: string
  broker_name: string
}

// --- Ticker Detail ---
export interface TickerPricePoint {
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  change_pct: number
}

export interface BrokerVolume {
  broker_code: string
  broker_name: string
  broker_type: string
  buy_lot: number
  sell_lot: number
  buy_volume: number
  sell_volume: number
  buy_value: number
  sell_value: number
  net_value: number
  active_days: number
}

export interface BrokerSummaryEntry {
  trade_date: string
  broker_code: string
  broker_name: string
  broker_type: string
  broker_group: string
  buy_lot: number
  sell_lot: number
  buy_volume: number
  sell_volume: number
  buy_value: number
  sell_value: number
  net_value: number
  buy_avg_price: number
  sell_avg_price: number
  frequency: number
}

export type PriceChartRange = "1m" | "3m" | "1y"

export interface TickerDetail {
  symbol: string
  stock_name: string
  range: string
  from: string
  to: string
  price_chart: TickerPricePoint[]
  volume_by_broker: BrokerVolume[]
  broker_summary: BrokerSummaryEntry[]
}

// --- Broker Flow Analysis ---
export interface AnalyzeAnomaly {
  stock_code: string
  broker_code: string
  broker_type: string
  trade_date: string
  net_value: number
  formatted_net: string
  z_score: number
  is_market_maker: boolean
}

export interface AnalyzeBrokerFlow {
  broker_code: string
  broker_type: string
  buy_value: number
  sell_value: number
  net_value: number
  buy_lot: number
  sell_lot: number
  net_lot: number
  buy_avg_price: number
  sell_avg_price: number
  active_days: number
  formatted_net_value: string
  display_status: string
}

export interface StockAnalyze {
  symbol: string
  start_date: string
  end_date: string
  total_days: number
  phase: string
  total_buy_value: number
  total_sell_value: number
  net_value: number
  foreign_net_value: number
  government_net: number
  local_net_value: number
  total_brokers: number
  retail_net: number
  institutional_net: number
  local_mid_net: number
  smart_money_ratio: number
  retail_dominance: number
  top1_concentration: number
  buy_hhi: number
  sell_hhi: number
  total_hhi: number
  foreign_leadership: boolean
  smart_money_active_days: number
  smart_money_consistency: number
  smart_money_momentum: number
  first_half_date: string
  second_half_date: string
  first_half_net: number
  second_half_net: number
  momentum_accelerating: boolean
  price_change_pct: number
  price_confirms: boolean
  volume_spike_ratio: number
  has_volume_spike: boolean
  anomalies: AnalyzeAnomaly[]
  formatted_buy_value: string
  formatted_sell_value: string
  formatted_net_value: string
  formatted_foreign_net: string
  brokers_accumulation: AnalyzeBrokerFlow[]
  brokers_distribution: AnalyzeBrokerFlow[]
  display_status: string
  dominant_flow?: DominantBrokerFlow | null
  coverage?: BrokerFlowCoverage
  warnings?: string[]
}

export interface BrokerFlowCoverage {
  requested_start_date: string
  requested_end_date: string
  effective_start_date: string | null
  effective_end_date: string | null
  eligible_sessions: number
  covered_sessions: number
  coverage_ratio: number | null
  source: string
  data_scope: "top_25_each_side"
  is_truncated: boolean
  per_side_limit: number
}

export interface DominantBrokerFlow {
  broker_code: string
  broker_name: string
  broker_group: string
  direction: "ACCUMULATION" | "DISTRIBUTION"
  state: "ACCUMULATING" | "DISTRIBUTING" | "ACCUMULATION_WEAKENING" | "DISTRIBUTION_WEAKENING" | "MARKUP_EXTENDED"
  net_value: number
  formatted_net_value: string
  intensity: number | null
  same_sign_share: number | null
  net_direction_days: number
  observed_days: number
  covered_sessions: number
  consistency: number | null
  recent_5_net: number | null
  prior_5_net: number | null
  momentum: "ACCELERATING" | "WEAKENING" | "REVERSING" | "INSUFFICIENT_DATA"
  weighted_average_price: number | null
  latest_close: number | null
  price_position_pct: number | null
  price_confirmation: "CONFIRMED" | "NOT_CONFIRMED" | "UNAVAILABLE"
}

// --- Top Accumulation ---
export interface TopAccumulation {
  stock_code: string
  stock_name: string
  avg_close_strength: number
  last_trade_date: string
  last_price: number
  last_change: number
  net_foreign: string
  avg_value: string
  status: string
}

// --- Top Accumulation EOD ---
export interface TopAccumulationEod {
  stock_code: string
  stock_name: string
  avg_close_strength: number
  net_foreign: number
  avg_value: number
  last_trade_date: string
  last_price: number
  last_change: number
  last_volume: number
  last_avg_vol20: number
  last_ma20: number
  last_ma50: number
  last_res_20: number
  last_sup_20: number
  breakout_score: number
  formatted_net_foreign: string
  formatted_avg_value: string
  display_status: string
  local_participation: number
  last_rsi: number
}

// --- Silent Accumulation ---
export interface SilentAccumulation {
  stock_code: string
  stock_name: string
  avg_close_strength: number
  net_foreign: number
  avg_value: number
  last_trade_date: string
  last_price: number
  last_change: number
  last_volume: number
  last_avg_vol20: number
  last_ma20: number
  last_ma50: number
  last_res_20: number
  last_sup_20: number
  breakout_score: number
  local_participation: number
  formatted_net_foreign: string
  formatted_avg_value: string
  retail_sentiment: string
  display_status: string
  dist_to_support: number
  last_avg_vol100: number
}

// --- Top Swinger / Scalping ---
export interface TopSwinger {
  stock_code: string
  stock_name: string
  trade_date: string
  close_price: number
  high_price: number
  low_price: number
  close_strength: number
  volume: number
  value: number
  net_foreign: number
  avg_strength_5d: number
  vol_change_pct: number
  swing_score: number
  entry_price: number
  stop_loss: number
  take_profit: number
  vol_multiplier: number
  display_status: string
}

// --- Single Stock Statistic ---
export interface StatisticSingleStock {
  "Stock Code": string
  details: {
    date: string
    strength: string
    price: number
    vol: string
    change_price: number
    trend_status: string
    vol_change_percent: string
  }[]
}

// --- Backtest Result (EOD inline) ---
export interface BacktestResult {
  stock_code: string
  stock_name: string
  price_then: number
  res_then: number
  ma20_then: number
  price_now: number
  profit_loss_pct: number
  signal_at_then: string
  result_status: string
}

export interface BacktestResponse {
  details: BacktestResult[]
  win_rate: number
  total_win: number
  total_lose: number
  total_flat: number
  avg_profit: number
}

// --- Backtest Run (V1) ---
export interface BacktestRunRequest {
  run_name: string
  start_date: string
  end_date: string
  tp_percent: number
  sl_percent: number
  max_holding_days: number
}

export interface BacktestDetail {
  id: number
  backtest_run_id: number
  stock_code: string
  signal_date: string
  entry_date: string
  entry_price: number
  target_tp: number
  target_sl: number
  exit_date: string
  exit_price: number
  exit_reason: string
  holding_days: number
  status: string
  return_percent: number
}

export interface BacktestRun {
  id: number
  run_name: string
  start_date: string
  end_date: string
  tp_percent: number
  sl_percent: number
  max_holding_days: number
  total_signals: number
  total_trades: number
  gross_profit: number
  gross_loss: number
  win_trades: number
  loss_trades: number
  expired_trades: number
  win_rate: number
  profit_factor: number
  expectancy: number
  avg_holding_days: number
  total_return_percent: number
  max_drawdown: number
}

export interface BacktestRunResponse {
  run: BacktestRun
  details: BacktestDetail[]
}

// --- Broker Flow Backtest V2 ---
export type BrokerFlowBacktestDirection = "ACCUMULATION" | "DISTRIBUTION" | "BOTH"
export type BrokerFlowBacktestHorizon = 1 | 5 | 10 | 20

export interface BrokerFlowBacktestRequest {
  symbols: string[]
  start_date: string
  end_date: string
  as_of_date?: string
  lookback_sessions?: number
  horizons?: BrokerFlowBacktestHorizon[]
  min_consistency?: number
  min_intensity?: number
  min_same_sign_share?: number
  direction?: BrokerFlowBacktestDirection
  max_results?: number
  persist_result?: boolean
  batch_id?: string
  variant_number?: number
  variant_name?: string
}

export interface BrokerFlowBacktestOutcome {
  horizon_sessions: number
  exit_date: string | null
  exit_close: number | null
  return_pct: number | null
  benchmark_pct: number | null
  excess_return_pct: number | null
  max_adverse_excursion_pct: number | null
}

export interface BrokerFlowBacktestRow {
  stock_code: string
  signal_date: string
  entry_date: string
  entry_price: number
  direction: Exclude<BrokerFlowBacktestDirection, "BOTH">
  broker_code: string
  net_value: number
  intensity: number
  consistency: number
  same_sign_share: number
  covered_sessions: number
  outcomes: Record<string, BrokerFlowBacktestOutcome>
}

export interface BrokerFlowHorizonStats {
  horizon_sessions: number
  sample_size: number
  hit_rate: number | null
  mean_return_pct: number | null
  median_return_pct: number | null
  mean_excess_return_pct: number | null
  mean_max_adverse_excursion_pct: number | null
}

export interface BrokerFlowBacktestResponse {
  version: string
  parameters: BrokerFlowBacktestRequest
  total_signals: number
  returned: number
  truncated: boolean
  stats: BrokerFlowHorizonStats[]
  results: BrokerFlowBacktestRow[]
  data_scope: string
  warnings: string[]
  persisted: boolean
  batch_id?: string | null
  rows_inserted?: number
}

// --- Auth Types ---
export interface AuthUser {
  id: number
  email: string
  name: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  phone: string
  email: string
  address: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
}

// --- Portfolio (Local Model) ---
export interface PortfolioHolding {
  id: string
  ticker: string
  lot: number
  avg_price: number
  broker: string
  added_at: string
  updated_at: string
}

export interface PortfolioSummary {
  total_investment: number
  current_value: number
  total_gain_loss: number
  total_gain_loss_percent: number
  holdings: PortfolioHolding[]
}

// --- Liquidity Metrics ---
export interface LiquidityMetrics {
  stock_code: string
  trade_date: string
  close_price: number
  listed_shares: number
  free_float_pct: number

  adtv_20d?: number | null
  adtv_3m?: number | null
  adtv_6m?: number | null
  adtv_12m?: number | null

  trading_freq_3m?: number | null
  trading_freq_12m?: number | null

  turnover_1d?: number | null
  avg_turnover_20d?: number | null
  avg_turnover_3m?: number | null
  avg_turnover_6m?: number | null
  avg_turnover_12m?: number | null

  full_market_cap?: number | null
  free_float_market_cap?: number | null

  adtv_20d_formatted?: string | null
  adtv_3m_formatted?: string | null
  adtv_6m_formatted?: string | null
  adtv_12m_formatted?: string | null
  full_market_cap_formatted?: string | null
  free_float_market_cap_formatted?: string | null
}

// --- Watchlist ---
export interface WatchlistItem {
  id: string
  ticker: string
  name: string
  added_at: string
}

// --- Generic API Response ---
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  error?: string
}
