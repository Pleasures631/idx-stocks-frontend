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

// --- Broker List ---
export interface BrokerListItem {
  broker_code: string
  broker_name: string
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
  email: string
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
