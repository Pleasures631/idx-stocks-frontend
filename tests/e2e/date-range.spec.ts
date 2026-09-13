import { expect, test } from "@playwright/test"

const detailResponse = {
  success: true,
  data: {
    symbol: "BBCA",
    stock_name: "Bank Central Asia",
    range: "1m",
    from: "2026-08-01",
    to: "2026-09-04",
    price_chart: [
      { trade_date: "2026-09-03", open: 9000, high: 9100, low: 8950, close: 9050, volume: 1000, change_pct: 0.5 },
      { trade_date: "2026-09-04", open: 9050, high: 9150, low: 9000, close: 9100, volume: 1200, change_pct: 0.55 },
    ],
    volume_by_broker: [],
    broker_summary: [
      {
        trade_date: "2026-09-04",
        broker_code: "YP",
        broker_name: "Yapindo",
        broker_type: "LOCAL",
        broker_group: "RETAIL",
        buy_lot: 100,
        sell_lot: 20,
        buy_volume: 10000,
        sell_volume: 2000,
        buy_value: 91000000,
        sell_value: 18000000,
        net_value: 73000000,
        frequency: 12,
      },
      {
        trade_date: "2026-09-04",
        broker_code: "AB",
        broker_name: "Artha Broker",
        broker_type: "LOCAL",
        broker_group: "INSTITUTIONAL",
        buy_lot: 20,
        sell_lot: 100,
        buy_volume: 2000,
        sell_volume: 10000,
        buy_value: 18000000,
        sell_value: 91000000,
        net_value: -73000000,
        frequency: 10,
      },
    ],
  },
}

const analyzeResponse = {
  success: true,
  data: {
    symbol: "BBCA",
    start_date: "2026-08-01",
    end_date: "2026-09-04",
    total_days: 25,
    phase: "ACCUMULATION",
    total_buy_value: 100000000,
    total_sell_value: 80000000,
    net_value: 20000000,
    foreign_net_value: 10000000,
    government_net: 0,
    local_net_value: 10000000,
    total_brokers: 1,
    retail_net: 0,
    institutional_net: 0,
    local_mid_net: 0,
    smart_money_ratio: 1,
    retail_dominance: 0,
    top1_concentration: 0,
    buy_hhi: 10000,
    sell_hhi: 10000,
    total_hhi: 10000,
    foreign_leadership: false,
    smart_money_active_days: 1,
    smart_money_consistency: 1,
    smart_money_momentum: 0,
    first_half_date: "2026-08-01",
    second_half_date: "2026-09-04",
    first_half_net: 10000000,
    second_half_net: 10000000,
    brokers: [],
    anomalies: [],
  },
}

test("custom date ranges are clickable and independent", async ({ page }) => {
  const detailRequests: string[] = []

  await page.route("http://localhost:8080/stocks/BBCA**", async (route) => {
    detailRequests.push(route.request().url())
    if (route.request().url().includes("/analyze")) {
      await route.fulfill({ json: analyzeResponse })
    } else {
      await route.fulfill({ json: detailResponse })
    }
  })

  await page.goto("/stocks/BBCA")
  await expect(page.getByText("Price History")).toBeVisible()
  await page.getByRole("tab", { name: "Broker Summary" }).click()
  const netFlowSwitch = page.getByRole("switch", { name: /Net Flow/ })
  await expect(netFlowSwitch).toBeVisible()
  await expect(netFlowSwitch).toHaveAttribute("aria-checked", "true")
  await expect(page.getByText("Yapindo", { exact: true })).toHaveCount(1)
  await expect(page.getByText("Artha Broker", { exact: true })).toHaveCount(1)
  await netFlowSwitch.click()
  await expect(netFlowSwitch).toHaveAttribute("aria-checked", "false")
  await expect(page.getByText("Yapindo", { exact: true })).toHaveCount(2)
  await expect(page.getByText("Artha Broker", { exact: true })).toHaveCount(2)

  await page.getByRole("tab", { name: "Price Chart" }).click()
  await page.getByLabel("Price chart start date").fill("2026-08-10")
  await page.getByLabel("Price chart end date").fill("2026-08-20")
  await page.getByRole("button", { name: "Apply" }).first().click()

  await expect.poll(() => detailRequests.some((url) => url.includes("from=2026-08-10") && url.includes("to=2026-08-20"))).toBe(true)

  await page.getByRole("tab", { name: "Broker Summary" }).click()
  await page.getByLabel("Start date").fill("2026-08-15")
  await page.getByLabel("End date").fill("2026-08-25")
  await page.getByRole("button", { name: "Apply" }).last().click()

  await expect.poll(() => detailRequests.some((url) => url.includes("from=2026-08-15") && url.includes("to=2026-08-25"))).toBe(true)

  await page.getByRole("button", { name: "Custom Range" }).click()
  await page.getByRole("menuitem", { name: "Latest" }).click()
  await expect(page.getByLabel("Start date")).toHaveValue("")
  await expect(page.getByLabel("End date")).toHaveValue("")
})
