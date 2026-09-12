import { expect, test } from "@playwright/test"

import { brokerFlowSweepVariants, runBrokerFlowSweep } from "../../scripts/run-broker-flow-browser-sweep.mjs"

test("browser sweep clicks and persists all 20 deterministic variants in one batch", async ({ page }) => {
  test.setTimeout(120_000)
  const batchId = "abcdef0123456789abcdef0123456789"
  const requests = []

  await page.route("http://localhost:8080/api/v2/backtests/broker-flow", async (route) => {
    const request = route.request().postDataJSON()
    requests.push(request)
    await route.fulfill({
      json: {
        success: true,
        data: {
          version: "broker-flow-v2",
          parameters: request,
          total_signals: 0,
          returned: 0,
          truncated: false,
          stats: [],
          results: [],
          data_scope: "top_25_each_side",
          warnings: [],
          persisted: true,
          batch_id: batchId,
          rows_inserted: 4,
        },
      },
    })
  })

  const returnedBatchId = await runBrokerFlowSweep(page, {
    ticker: "CUAN",
    start: "2026-05-01",
    end: "2026-09-12",
    asOf: "",
    baseUrl: "http://127.0.0.1:3000",
    headless: true,
  }, () => {})

  expect(returnedBatchId).toBe(batchId)
  expect(requests).toHaveLength(20)
  expect(requests[0]).not.toHaveProperty("batch_id")
  expect(requests.slice(1).every((request) => request.batch_id === batchId)).toBe(true)
  expect(requests.every((request) => request.symbols.join(",") === "CUAN")).toBe(true)
  expect(requests.every((request) => request.lookback_sessions === 20 && request.direction === "ACCUMULATION")).toBe(true)
  expect(requests.every((request) => JSON.stringify(request.horizons) === "[1,5,10,20]")).toBe(true)

  expect(requests.map((request) => ({
    number: request.variant_number,
    name: request.variant_name,
    consistency: request.min_consistency,
    intensity: request.min_intensity,
    sameSign: request.min_same_sign_share,
  }))).toEqual(brokerFlowSweepVariants)
})
