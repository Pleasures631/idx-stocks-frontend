import { expect, test } from "@playwright/test"

const detailResponse = {
  success: true,
  data: {
    symbol: "CUAN",
    stock_name: "Petrindo Jaya Kreasi Tbk.",
    range: "1m",
    from: "2026-08-10",
    to: "2026-09-08",
    price_chart: [
      { trade_date: "2026-09-08", open: 1500, high: 1550, low: 1480, close: 1525, volume: 1_000_000, change_pct: 1.67 },
    ],
    volume_by_broker: [],
    broker_summary: [],
  },
}

const analyzeResponse = {
  success: true,
  data: {
    symbol: "CUAN",
    total_brokers: 0,
    brokers_accumulation: [],
    brokers_distribution: [],
    anomalies: [],
  },
}

test("maps liquidity API fields and distinguishes missing metrics from zero", async ({ page }) => {
  await page.route("http://localhost:8080/stocks/CUAN**", async (route) => {
    const pathname = new URL(route.request().url()).pathname

    if (pathname.endsWith("/liquidity-metrics")) {
      await route.fulfill({
        json: {
          success: true,
          data: {
            stock_code: "CUAN",
            trade_date: "2026-09-08",
            close_price: 1525,
            listed_shares: 112_490_000_000,
            free_float_pct: 10.25,
            adtv_20d: 123_456_789,
            adtv_20d_formatted: "123.46 M",
            adtv_3m: 4_500_000_000,
            adtv_3m_formatted: null,
            adtv_6m: null,
            adtv_12m: 0,
            adtv_12m_formatted: "0.00",
            trading_freq_3m: 0.873,
            trading_freq_12m: null,
            turnover_1d: 0.0012,
            avg_turnover_20d: 0.0011,
            avg_turnover_3m: 0.001,
            avg_turnover_6m: 0.0004,
            avg_turnover_12m: 0,
            full_market_cap: 171_547_250_000_000,
            full_market_cap_formatted: "171.55 T",
            free_float_market_cap: 17_583_593_125_000,
            free_float_market_cap_formatted: "17.58 T",
          },
        },
      })
      return
    }

    if (pathname.endsWith("/analyze")) {
      await route.fulfill({ json: analyzeResponse })
      return
    }

    await route.fulfill({ json: detailResponse })
  })

  await page.goto("/stocks/CUAN")
  await page.getByRole("tab", { name: "Liquidity" }).click()

  await expect(page.getByText("Liquidity & Market Structure", { exact: true })).toBeVisible()
  await expect(page.getByText("123.46 M", { exact: true })).toBeVisible()
  await expect(page.getByText("4.5B", { exact: true })).toBeVisible()
  await expect(page.getByText("87.3%", { exact: true })).toBeVisible()
  await expect(page.getByText("0.1%", { exact: true })).toHaveCount(3)
  await expect(page.getByText("0.040%", { exact: true })).toBeVisible()
  await expect(page.getByText("0.0%", { exact: true })).toHaveCount(1)
  await expect(page.getByText("N/A", { exact: true })).toHaveCount(2)
  await expect(page.getByText("171.55 T", { exact: true })).toBeVisible()
  await expect(page.getByText("17.58 T", { exact: true })).toBeVisible()
})
