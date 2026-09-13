import { expect, test } from "@playwright/test"

test.describe("legal and privacy module", () => {
  for (const route of ["/privacy", "/terms", "/disclaimer"]) {
    test(`${route} is publicly reachable`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator("h1")).toBeVisible()
      await expect(page.getByRole("link", { name: "Kebijakan Privasi" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Syarat & Ketentuan" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Disclaimer Investasi" })).toBeVisible()
    })
  }
})

test("registration requires reading and accepting terms", async ({ page }) => {
  await page.goto("/register")
  const checkbox = page.getByRole("checkbox", { name: "Saya menyetujui Syarat & Ketentuan" })
  const submit = page.getByRole("button", { name: "Create profile" })
  await expect(checkbox).toBeDisabled()
  await expect(submit).toBeDisabled()
  const terms = page.getByRole("region", { name: "Syarat dan Ketentuan Yapping Saham" })
  await terms.evaluate((element) => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event("scroll", { bubbles: true })) })
  await expect(checkbox).toBeEnabled()
  await checkbox.check()
  await expect(submit).toBeEnabled()
})

test("settings exposes protected account data controls", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("access_token", "test-access-token")
    sessionStorage.setItem("refresh_token", "test-refresh-token")
    sessionStorage.setItem("auth_user", JSON.stringify({ id: 1, name: "Test User", email: "test@example.com" }))
  })
  await page.route("**/auth/me", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { id: 1, name: "Test User", email: "test@example.com" } }) }))
  await page.route("**/health", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }))
  await page.goto("/settings")
  await expect(page.getByRole("heading", { name: "Data & account" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Minta hapus akun" })).toBeDisabled()
  await page.getByLabel("Ketik DELETE MY ACCOUNT untuk melanjutkan").fill("DELETE MY ACCOUNT")
  await expect(page.getByRole("button", { name: "Minta hapus akun" })).toBeEnabled()
})
