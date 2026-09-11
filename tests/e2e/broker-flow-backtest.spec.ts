import { expect, test } from "@playwright/test"

const responseData = {
  version: "broker-flow-v2",
  parameters: {
    symbols: ["CUAN", "BBCA", "TLKM"],
    start_date: "2026-03-11",
    end_date: "2026-09-11",
    lookback_sessions: 20,
    horizons: [1, 5, 10, 20],
    min_consistency: 0.6,
    min_intensity: 0.05,
    min_same_sign_share: 0.4,
    direction: "ACCUMULATION",
    max_results: 500,
  },
  total_signals: 1,
  returned: 1,
  truncated: false,
  stats: [{ horizon_sessions: 5, sample_size: 1, hit_rate: 100, mean_return_pct: 4.2, median_return_pct: 4.2, mean_excess_return_pct: 3.1, mean_max_adverse_excursion_pct: -1.2 }],
  results: [{
    stock_code: "CUAN",
    signal_date: "2026-09-01",
    entry_date: "2026-09-02",
    entry_price: 1600,
    direction: "ACCUMULATION",
    broker_code: "CC",
    net_value: 175_000_000_000,
    intensity: 0.12,
    consistency: 0.8,
    same_sign_share: 0.55,
    covered_sessions: 20,
    outcomes: { "5d": { horizon_sessions: 5, exit_date: "2026-09-09", exit_close: 1667, return_pct: 4.2, benchmark_pct: 1.1, excess_return_pct: 3.1, max_adverse_excursion_pct: -1.2 } },
  }],
  data_scope: "top_25_each_side",
  warnings: ["Exodus source is limited to top 25 brokers per side."],
}

test("runs a bounded broker-flow backtest and renders backend statistics", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined
  await page.route("http://localhost:8080/api/v2/backtests/broker-flow", async (route) => {
    submittedBody = route.request().postDataJSON()
    await route.fulfill({ json: { success: true, data: responseData } })
  })

  await page.goto("/broker-flow-backtest")
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { name: "Broker Flow Backtest" })).toBeVisible()
  await page.getByRole("button", { name: "Jalankan backtest" }).click()

  await expect(page.getByRole("heading", { name: "Hasil backtest" })).toBeVisible()
  await expect(page.getByText("Engine broker-flow-v2")).toBeVisible()
  await expect(page.getByRole("cell", { name: "CC 20 sesi" })).toBeVisible()
  await expect(page.getByText("Exodus source is limited to top 25 brokers per side.")).toBeVisible()
  await expect(page.getByRole("row", { name: "5D 1 100.0% +4.20% +4.20% +3.10% -1.20%" })).toBeVisible()
  expect(submittedBody).toMatchObject({
    symbols: ["CUAN", "BBCA", "TLKM"],
    lookback_sessions: 20,
    direction: "ACCUMULATION",
    min_consistency: 0.6,
    min_intensity: 0.05,
    min_same_sign_share: 0.4,
  })
})

test("validates ticker count and renders a valid empty result", async ({ page }) => {
  await page.route("http://localhost:8080/api/v2/backtests/broker-flow", async (route) => {
    await route.fulfill({ json: { success: true, data: { ...responseData, total_signals: 0, returned: 0, stats: [], results: [], warnings: [] } } })
  })

  await page.goto("/broker-flow-backtest")
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Ticker").fill("")
  await page.getByRole("button", { name: "Jalankan backtest" }).click()
  await expect(page.getByText("Masukkan minimal satu ticker")).toBeVisible()

  await page.getByLabel("Ticker").fill("CUAN")
  await page.getByRole("button", { name: "Jalankan backtest" }).click()
  await expect(page.getByText("Tidak ada sinyal yang memenuhi threshold")).toBeVisible()
})

test("is available from the mobile drawer without changing bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/broker-flow-backtest")
  await page.waitForLoadState("networkidle")
  await page.locator("header button").first().click()
  await expect(page.getByRole("link", { name: "Broker Backtest" })).toHaveAttribute("href", "/broker-flow-backtest")
  await expect(page.getByRole("link", { name: "Broker Backtest" })).toBeVisible()
})
