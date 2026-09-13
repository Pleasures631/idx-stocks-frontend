import { expect, test } from "@playwright/test"

test("renders the Wyckoff orbit and opens a planet detail", async ({ page }) => {
  await page.goto("/wyckoff")

  await expect(page.getByRole("heading", { name: "Market Cycle Orbit" })).toBeVisible()
  await expect(page.getByText("Market Cycle", { exact: true })).toBeVisible()
  await expect(page.getByText("Accumulation", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Markup", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Distribution", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Markdown", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("PREVIEW — NOT LIVE", { exact: true })).toBeVisible()
  await expect(page.getByText("Mode preview aktif", { exact: true })).toBeVisible()
  await expect(page.getByText("Source: Frontend preview fixture", { exact: true })).toBeVisible()
  await expect(page.getByText("Data mungkin sudah stale", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "BMRI, markup, score 91" }).click()
  await expect(page.locator("p").filter({ hasText: "Bank Mandiri" }).last()).toBeVisible()
  await expect(page.getByText("Preview signal", { exact: true })).toBeVisible()
  await expect(page.getByText("Breakout bertahan di atas resistance dengan volume menguat.", { exact: true })).toBeVisible()
})
