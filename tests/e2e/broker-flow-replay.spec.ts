import { expect, test } from "@playwright/test"

const detailResponse = {
  success: true,
  data: {
    symbol: "CUAN",
    stock_name: "Petrindo Jaya Kreasi Tbk.",
    range: "1m",
    from: "2026-05-01",
    to: "2026-06-02",
    price_chart: [{ trade_date: "2026-06-02", open: 1000, high: 1100, low: 950, close: 1050, volume: 1000, change_pct: 5 }],
    volume_by_broker: [],
    broker_summary: [],
  },
}

function analyzeResponse(to: string) {
  return {
    success: true,
    data: {
      symbol: "CUAN",
      start_date: "2026-05-01",
      end_date: to,
      total_days: 5,
      phase: "BIG MONEY ACCUMULATION",
      total_buy_value: 100000000,
      total_sell_value: 80000000,
      net_value: 20000000,
      foreign_net_value: 30000000,
      government_net: 0,
      local_net_value: 0,
      total_brokers: 1,
      retail_net: 10000000,
      institutional_net: 20000000,
      local_mid_net: 0,
      big_money_net: 20000000,
      retail_absorption: false,
      smart_money_ratio: 20,
      retail_dominance: 10,
      top1_concentration: 1,
      buy_hhi: 10000,
      sell_hhi: 10000,
      total_hhi: 10000,
      foreign_leadership: true,
      smart_money_active_days: 4,
      smart_money_consistency: 0.8,
      smart_money_momentum: 0,
      first_half_date: "2026-05-05",
      second_half_date: to,
      first_half_net: 10000000,
      second_half_net: 10000000,
      momentum_accelerating: false,
      price_change_pct: 2,
      price_confirms: true,
      volume_spike_ratio: 1,
      has_volume_spike: false,
      anomalies: [],
      formatted_buy_value: "100M",
      formatted_sell_value: "80M",
      formatted_net_value: "20M",
      formatted_foreign_net: "30M",
      brokers_accumulation: [{ broker_code: "AK", broker_type: "Asing", broker_group: "FOREIGN", buy_value: 50000000, sell_value: 10000000, net_value: 40000000, buy_lot: 1, sell_lot: -1, net_lot: 0, buy_avg_price: 1000, sell_avg_price: 1000, active_days: 4, formatted_net_value: "40M", display_status: "AK | Net: 40M" }],
      brokers_distribution: [{ broker_code: "CC", broker_type: "Lokal", broker_group: "RETAIL", buy_value: 10000000, sell_value: 30000000, net_value: -20000000, buy_lot: 1, sell_lot: -1, net_lot: 0, buy_avg_price: 1000, sell_avg_price: 1000, active_days: 4, formatted_net_value: "-20M", display_status: "CC | Net: -20M" }],
      display_status: "BIG MONEY ACCUMULATION",
      dominant_flow: {
        broker_code: "AK",
        broker_name: "AK Securities",
        broker_group: "FOREIGN",
        direction: "ACCUMULATION",
        state: "ACCUMULATING",
        net_value: 40000000,
        formatted_net_value: "40M",
        intensity: 0.2,
        same_sign_share: 0.5,
        net_direction_days: 4,
        observed_days: 4,
        covered_sessions: 5,
        consistency: 0.8,
        recent_5_net: 40000000,
        prior_5_net: null,
        momentum: "INSUFFICIENT_DATA",
        weighted_average_price: 1000,
        latest_close: 1050,
        price_position_pct: 0.05,
        price_confirmation: "CONFIRMED",
      },
      coverage: { requested_start_date: "2026-05-05", requested_end_date: to, effective_start_date: "2026-05-05", effective_end_date: to, eligible_sessions: 5, covered_sessions: 5, coverage_ratio: 1, source: "Exodus", data_scope: "top_25_each_side", is_truncated: true, per_side_limit: 25 },
      warnings: [],
      broker_behavior_profiles: [],
    },
  }
}

test("replays broker flow indicators at weekly historical snapshots", async ({ page }) => {
  const analyzeRequests: string[] = []
  await page.route("http://localhost:8080/stocks/CUAN**", async (route) => {
    const url = route.request().url()
    if (url.includes("/analyze")) {
      analyzeRequests.push(url)
      const to = new URL(url).searchParams.get("to") ?? "2026-09-12"
      await route.fulfill({ json: analyzeResponse(to) })
      return
    }
    await route.fulfill({ json: detailResponse })
  })

  await page.goto("/stocks/CUAN")
  await page.getByRole("tab", { name: "Analisis Broker Flow" }).click()
  await expect(page.getByText("Replay Historical Broker Flow")).toBeVisible()
  const replayButton = page.getByRole("button", { name: "Jalankan replay" })
  const firstSnapshotDate = page.locator('input[type="date"]').first()
  await firstSnapshotDate.fill("2026-06-06")
  await expect(page.getByText("Pilih hari bursa, Senin-Jumat.")).toBeVisible()
  await expect(replayButton).toBeDisabled()
  await firstSnapshotDate.fill("2026-05-11")
  await expect(replayButton).toBeEnabled()
  await replayButton.click()

  await expect(page.getByText("2026-05-11", { exact: true })).toBeVisible()
  await expect(page.getByText("2026-05-25", { exact: true })).toBeVisible()
  await expect(page.getByText("2026-06-02", { exact: true })).toBeVisible()
  await expect(page.getByText("Akumulasi Big Money").first()).toBeVisible()
  expect(analyzeRequests.some((url) => url.includes("from=2026-05-05") && url.includes("to=2026-05-11"))).toBe(true)
  expect(analyzeRequests.some((url) => url.includes("from=2026-05-19") && url.includes("to=2026-05-25"))).toBe(true)
  expect(analyzeRequests.some((url) => url.includes("from=2026-05-27") && url.includes("to=2026-06-02"))).toBe(true)
})
