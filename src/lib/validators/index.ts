import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
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

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PortfolioFormData = z.infer<typeof portfolioSchema>
export type WatchlistFormData = z.infer<typeof watchlistSchema>
export type BacktestFormData = z.infer<typeof backtestSchema>
