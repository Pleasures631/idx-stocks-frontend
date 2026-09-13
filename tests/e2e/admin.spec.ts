import { expect, test, type Page } from "@playwright/test"

const user = {
  id: 7,
  name: "Regular User",
  email: "user@example.com",
  created_at: "2026-01-01T00:00:00Z",
  role: "user",
}

async function seedSession(page: Page, sessionUser = user, token = "test-access-token") {
  await page.addInitScript(({ seededUser, seededToken }) => {
    sessionStorage.setItem("access_token", seededToken)
    sessionStorage.setItem("refresh_token", `${seededToken}-refresh`)
    sessionStorage.setItem("auth_user", JSON.stringify(seededUser))
  }, { seededUser: sessionUser, seededToken: token })
  await page.route("**/auth/me", async (route) => route.fulfill({ json: { user: sessionUser } }))
}

test("ordinary users do not see admin navigation and get a forbidden state", async ({ page }) => {
  await seedSession(page)
  await page.goto("/dashboard")
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0)

  await page.goto("/admin")
  await expect(page.getByRole("heading", { name: "Admin access required" })).toBeVisible()
  await expect(page.getByText("Manage access and subscriptions", { exact: false })).toHaveCount(0)
})

test("sessions remain isolated between tabs", async ({ page, context }) => {
  const admin = { ...user, name: "Admin Tab", email: "admin-tab@example.com", role: "admin" as const }
  await seedSession(page, admin, "admin-token")
  const secondTab = await context.newPage()
  await seedSession(secondTab, user, "user-token")

  await page.goto("/dashboard")
  await secondTab.goto("/dashboard")

  await expect(page.getByRole("link", { name: "Admin" })).toBeVisible()
  await expect(secondTab.getByRole("link", { name: "Admin" })).toHaveCount(0)
  await expect(page.getByText("Admin Tab")).toBeVisible()
  await expect(secondTab.getByText("Regular User")).toBeVisible()
})


test("admins can load the backoffice users table and audit activity", async ({ page }) => {
  const admin = { ...user, name: "Admin User", email: "admin@example.com", role: "admin" as const }
  await seedSession(page, admin)
  await page.route("**/admin/users**", async (route) => route.fulfill({ json: { users: [{ id: 12, name: "Member One", email: "member@example.com", role: "user", registration_date: "2026-02-01T00:00:00Z", subscription_status: "active", subscription_start_date: "2026-09-01T00:00:00Z", subscription_expiry_date: "2026-10-01T00:00:00Z" }], pagination: { limit: 25, offset: 0, total: 1, has_more: false } } }))
  await page.route("**/admin/audit", async (route) => route.fulfill({ json: [{ id: 1, action: "subscription.activate", admin_name: "Admin User", target_user_name: "Member One", created_at: "2026-09-13T00:00:00Z" }] }))

  await page.goto("/admin")
  await expect(page.getByRole("heading", { name: "Admin overview" })).toBeVisible()
  await expect(page.getByText("member@example.com")).toBeVisible()
  await expect(page.getByText("subscription.activate")).toBeVisible()
  await expect(page.getByRole("button", { name: "Activate 30d" })).toBeVisible()
})


test("admins can search users on the server and load the next page", async ({ page }) => {
  const admin = { ...user, name: "Admin Search", email: "admin-search@example.com", role: "admin" as const }
  await seedSession(page, admin)
  const requests: string[] = []
  await page.route("**/admin/users**", async (route) => {
    const url = new URL(route.request().url())
    const q = url.searchParams.get("q") ?? ""
    const offset = Number(url.searchParams.get("offset") ?? "0")
    requests.push(`${q}:${offset}`)
    const result = offset === 0
      ? { id: 20, name: q ? "Alice Search" : "First User", email: q ? "alice@example.com" : "first@example.com" }
      : { id: 21, name: "Second User", email: "second@example.com" }
    await route.fulfill({ json: { users: [{ ...result, role: "user", registration_date: "2026-02-01T00:00:00Z", subscription_status: "inactive", subscription_start_date: null, subscription_expiry_date: null }], pagination: { limit: 25, offset, total: 26, has_more: offset === 0 } } })
  })
  await page.route("**/admin/audit", async (route) => route.fulfill({ json: [] }))

  await page.goto("/admin")
  await expect(page.getByText("first@example.com")).toBeVisible()
  await page.getByRole("textbox", { name: "Search users" }).fill("alice")
  await expect(page.getByText("alice@example.com")).toBeVisible()
  await expect(page.getByText("first@example.com")).toHaveCount(0)
  await expect(page.getByTestId("admin-load-more")).toBeVisible()
  await page.getByTestId("admin-load-more").click()
  await expect(page.getByText("second@example.com")).toBeVisible()
  await expect(page.getByTestId("admin-no-more")).toBeVisible()
  expect(requests.filter((request) => request === "alice:0")).toHaveLength(1)
  expect(requests).toContain("alice:25")
})

test("inactive users stay logged in but premium navigation and routes are locked", async ({ page }) => {
  const inactive = { ...user, subscription: { status: "inactive" as const } }
  await seedSession(page, inactive)
  await page.route("**/auth/me", async (route) => route.fulfill({ json: { user: inactive, subscription: { status: "inactive" } } }))

  await page.goto("/dashboard")
  await expect(page.getByText("Regular User")).toBeVisible()
  await expect(page.getByText("Broker Flow Analysis", { exact: true })).toBeVisible()
  await expect(page.getByTitle(/account inactive/i).first()).toBeVisible()

  await page.goto("/broker-flow-backtest")
  await expect(page.getByTestId("locked-feature")).toBeVisible()
  await expect(page.getByText(/account is inactive/i)).toBeVisible()
})

test("admins retain premium access even when subscription is inactive", async ({ page }) => {
  const admin = { ...user, role: "admin" as const, subscription: { status: "inactive" as const } }
  await seedSession(page, admin)
  await page.route("**/auth/me", async (route) => route.fulfill({ json: { user: admin, subscription: { status: "inactive" } } }))
  await page.goto("/broker-flow-backtest")
  await expect(page.getByTestId("locked-feature")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Broker Flow Backtest" })).toBeVisible()
})
