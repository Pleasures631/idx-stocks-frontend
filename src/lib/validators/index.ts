import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^(?:\+62|62|0)8\d{8,11}$/, "Use an Indonesian phone format (08..., 62..., or +62...)"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters").max(500, "Address is too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const portfolioSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(5, "Ticker is too long"),
  lot: z.number().min(1, "Lot must be at least 1"),
  avg_price: z.number().min(1, "Price must be greater than 0"),
  broker: z.string().min(1, "Broker is required"),
})

export const watchlistSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(5, "Ticker is too long"),
})

export const backtestSchema = z.object({
  run_name: z.string().min(1, "Run name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  tp_percent: z.number().min(0.1, "TP must be > 0").max(50, "TP must be < 50"),
  sl_percent: z.number().min(0.1, "SL must be > 0").max(50, "SL must be < 50"),
  max_holding_days: z.number().min(1, "Min 1 day").max(365, "Max 365 days"),
})

export const brokerFlowBacktestSchema = z.object({
  symbols: z.array(z.string().min(1)).min(1, "Masukkan minimal satu ticker").max(20, "Maksimal 20 ticker"),
  start_date: z.string().min(1, "Tanggal awal wajib diisi"),
  end_date: z.string().min(1, "Tanggal akhir wajib diisi"),
  as_of_date: z.string().optional(),
  lookback_sessions: z.number().int().min(5).max(60),
  horizons: z.array(z.union([z.literal(1), z.literal(5), z.literal(10), z.literal(20)])).min(1),
  min_consistency: z.number().min(0).max(1),
  min_intensity: z.number().min(0).max(1),
  min_same_sign_share: z.number().min(0).max(1),
  direction: z.enum(["ACCUMULATION", "DISTRIBUTION", "BOTH"]),
  max_results: z.number().int().min(1).max(1000),
}).superRefine((data, ctx) => {
  if (data.start_date > data.end_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tanggal akhir tidak boleh sebelum tanggal awal", path: ["end_date"] })
  }
  if (data.as_of_date && data.as_of_date < data.end_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As-of date tidak boleh sebelum tanggal akhir", path: ["as_of_date"] })
  }
  if (data.start_date && data.end_date) {
    const start = Date.parse(`${data.start_date}T00:00:00Z`)
    const end = Date.parse(`${data.end_date}T00:00:00Z`)
    if (Number.isFinite(start) && Number.isFinite(end) && end - start > 366 * 24 * 60 * 60 * 1000) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Rentang maksimal 366 hari", path: ["end_date"] })
    }
  }
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PortfolioFormData = z.infer<typeof portfolioSchema>
export type WatchlistFormData = z.infer<typeof watchlistSchema>
export type BacktestFormData = z.infer<typeof backtestSchema>
export type BrokerFlowBacktestFormData = z.infer<typeof brokerFlowBacktestSchema>
