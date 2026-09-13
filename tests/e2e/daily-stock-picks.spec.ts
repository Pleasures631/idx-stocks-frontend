import { expect, test } from "@playwright/test"

const pickData = {
  signal_date: "2026-09-08",
  intended_execution_date: "2026-09-09",
  intended_execution_session: "next regular IDX session",
  timezone: "Asia/Jakarta",
  cutoff_time: "18:00 WIB",
  calendar_basis: "weekday_fallback_no_holiday_calendar",
  data_status: "ready",
  is_stale: false,
  latest_observed_date: "2026-09-08",
  latest_observed_stock_count: 900,
  comparison_stock_count: 898,
  latest_completeness_ratio: 1.0022,
  formula: {
    version: "daily-5-v2",
    description: "Early-swing screener on a 60-session universe.",
    eligibility: ["60 consecutive stored market sessions", "top 50% market cap", "ADTV20 and early-swing filters"],
    weights: { room: 0.25, trend: 0.2, base: 0.2, breakout: 0.15, liquidity: 0.15, broker: 0.05 },
  },
  picks: [
    {
      ticker: "BBCA",
      stock_name: "Bank Central Asia Tbk.",
      rank: 1,
      score: 88.25,
      signal_date: "2026-09-08",
      intended_execution_date: "2026-09-09",
      momentum_20d_pct: 8.5,
      trend_vs_sma20_pct: 3.2,
      average_value_20d: 2_500_000_000,
      volume_ratio_20d: 1.4,
      volatility_20d_pct: 1.2,
      setup_label: "Dekat Breakout",
      layer: "FIRST_LAYER",
      market_cap: 1_000_000_000_000,
      adtv_20d: 2_500_000_000,
      rsi_14: 56.4,
      return_5d_pct: 2.1,
      distance_to_high_20d_pct: 3.4,
      atr_14_pct: 4.2,
      broker_confirmation: "Positif",
      broker_flow_status: "confirmed_positive",
      component_scores: { room: 90, momentum: 88, trend: 80, base: 85, breakout: 92, liquidity: 95, volume: 65, risk: 85, broker: 100 },
      reasons: [
        "Momentum 20 sesi +8.50%",
        "Harga +3.20% terhadap SMA20",
        "Rata-rata nilai transaksi 20 sesi Rp2500000000",
        "Volume sesi sinyal 1.40x rata-rata 20 sesi",
        "Volatilitas return harian 20 sesi 1.20%",
      ],
    },
  ],
  limitations: ["No official exchange-holiday calendar is available."],
}

test("shows loading, ranked early-swing pick, formula, and disclaimer", async ({ page }) => {
  let releaseRequest: (() => void) | undefined
  const requestGate = new Promise<void>((resolve) => {
    releaseRequest = resolve
  })

  await page.route("http://localhost:8080/analyze/daily-stock-picks", async (route) => {
    await requestGate
    await route.fulfill({ json: { success: true, data: pickData } })
  })

  await page.goto("/daily-picks")
  await expect(page.getByText("Menghitung early-swing setup dari data EOD...")).toBeVisible()
  releaseRequest?.()

  await expect(page.getByRole("heading", { name: "Daily 5 Stock Picks" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "BBCA" })).toBeVisible()
  await expect(page.getByText("Early Swing Setup", { exact: true })).toBeVisible()
  await expect(page.getByText("Dekat Breakout")).toBeVisible()
  await expect(page.getByText("Status: confirmed_positive")).toBeVisible()
  await expect(page.getByText("Reasons & risk status")).toBeVisible()
  await expect(page.getByText("Ruang naik 25%")).toBeVisible()
  await expect(page.getByText("Broker flow 5%")).toBeVisible()
  await expect(page.getByText("Bukan nasihat investasi atau janji keuntungan.")).toBeVisible()
  await expect(page.getByText("2026-09-08", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("2026-09-09", { exact: true }).first()).toBeVisible()

  await page.getByText("Kriteria dan keterbatasan").click()
  await expect(page.getByText("No official exchange-holiday calendar is available.")).toBeVisible()
  await expect(page.getByRole("link", { name: "Daily 5 Picks" })).toHaveAttribute("href", "/daily-picks")
})

test("supports retry and a valid empty result", async ({ page }) => {
  let requests = 0
  let responseMode: "error" | "empty" = "error"
  await page.route("http://localhost:8080/analyze/daily-stock-picks", async (route) => {
    requests++
    if (responseMode === "error") {
      await route.fulfill({ status: 500, json: { success: false, message: "internal server error" } })
      return
    }
    await route.fulfill({ json: { success: true, data: { ...pickData, signal_date: null, intended_execution_date: null, data_status: "no_data", picks: [] } } })
  })

  await page.goto("/daily-picks")
  await expect(page.getByRole("alert").filter({ hasText: "belum dapat dimuat" })).toBeVisible()
  responseMode = "empty"
  await page.getByRole("button", { name: "Coba lagi" }).click()
  await expect(page.getByText("Belum ada kandidat early swing yang memenuhi filter")).toBeVisible()
  expect(requests).toBeGreaterThanOrEqual(2)
})

test("remains usable on mobile and exposes the new bottom navigation item", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route("http://localhost:8080/analyze/daily-stock-picks", async (route) => {
    await route.fulfill({ json: { success: true, data: pickData } })
  })

  await page.goto("/daily-picks")
  await expect(page.getByRole("heading", { name: "BBCA" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Picks" })).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
})
