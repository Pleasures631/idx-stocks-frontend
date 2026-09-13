import { expect, test } from "@playwright/test"

const stockList = {
  success: true,
  total: 3,
  data: [
    { stock_code: "BBCA", stock_name: "Bank Central Asia Tbk.", sector: "Keuangan", sub_sector: "Bank", industry: "Bank", sub_industry: "Bank", last_price: 9000, change_pct: 1, volume: 1000 },
    { stock_code: "TLKM", stock_name: "Telkom Indonesia Tbk.", sector: "Infrastruktur", sub_sector: "Telekomunikasi", industry: "Telekomunikasi", sub_industry: "Telekomunikasi", last_price: 3000, change_pct: -1, volume: 2000 },
    { stock_code: "NEW", stock_name: "New Listing Tbk.", sector: "", sub_sector: "", industry: "", sub_industry: "", last_price: 100, change_pct: 0, volume: 100 },
  ],
}

test("shows sector counts first and reveals emitens after selection", async ({ page }) => {
  await page.route("**/stocks/list**", async (route) => {
    await route.fulfill({ json: stockList })
  })

  await page.goto("/sectors")
  await expect(page.getByRole("heading", { name: "Sector" })).toBeVisible()
  await expect(page.getByText("Keuangan", { exact: true })).toBeVisible()
  await expect(page.getByText("Infrastruktur", { exact: true })).toBeVisible()
  await expect(page.getByText("Belum diklasifikasikan", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: /BBCA/ })).toHaveCount(0)

  await page.getByPlaceholder("Cari sector...").fill("Infra")
  await expect(page.getByText("Infrastruktur", { exact: true })).toBeVisible()
  await expect(page.getByText("Keuangan", { exact: true })).toHaveCount(0)

  await page.getByRole("button", { name: /Infrastruktur/ }).click()
  await expect(page.getByPlaceholder("Cari ticker atau nama emiten...")).toBeVisible()
  await expect(page.getByRole("link", { name: /TLKM/ })).toHaveAttribute("href", "/stocks/TLKM")
  await expect(page.getByRole("link", { name: /BBCA/ })).toHaveCount(0)
})
