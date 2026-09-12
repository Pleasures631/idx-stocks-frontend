import { expect, test } from "@playwright/test"

import { runBrokerFlowSweep } from "../../scripts/run-broker-flow-browser-sweep.mjs"

test("distribution sweep submits all 20 variants in one reused batch", async ({ page }) => {
  test.setTimeout(120_000)
  const batchId = "1234567890abcdef1234567890abcdef"
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
    ticker: "BRPT",
    start: "2026-05-01",
    end: "2026-09-12",
    asOf: "",
    baseUrl: "http://127.0.0.1:3000",
    headless: true,
    direction: "DISTRIBUTION",
  }, () => {})

  expect(returnedBatchId).toBe(batchId)
  expect(requests).toHaveLength(20)
  expect(requests[0]).not.toHaveProperty("batch_id")
  expect(requests.slice(1).every((request) => request.batch_id === batchId)).toBe(true)
  expect(requests.every((request) => request.direction === "DISTRIBUTION")).toBe(true)
})
