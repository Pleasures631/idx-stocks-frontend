import { expect, test, type Page } from "@playwright/test"

const user = {
  id: 7,
  name: "Regular User",
  email: "user@example.com",
  created_at: "2026-01-01T00:00:00Z",
  role: "user",
}

async function seedSession(page: Page, sessionUser = user) {
  await page.addInitScript(({ seededUser }) => {
    localStorage.setItem("access_token", "test-access-token")
    localStorage.setItem("refresh_token", "test-refresh-token")
    localStorage.setItem("auth_user", JSON.stringify(seededUser))
  }, { seededUser: sessionUser })
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

test("admins can load the backoffice users table and audit activity", async ({ page }) => {
  const admin = { ...user, name: "Admin User", email: "admin@example.com", role: "admin" }
  await seedSession(page, admin)
  await page.route("**/admin/users", async (route) => route.fulfill({ json: { users: [{ id: 12, name: "Member One", email: "member@example.com", role: "user", registration_date: "2026-02-01T00:00:00Z", subscription_status: "active", subscription_start_date: "2026-09-01T00:00:00Z", subscription_expiry_date: "2026-10-01T00:00:00Z" }] } }))
  await page.route("**/admin/audit", async (route) => route.fulfill({ json: [{ id: 1, action: "subscription.activate", admin_name: "Admin User", target_user_name: "Member One", created_at: "2026-09-13T00:00:00Z" }] }))

  await page.goto("/admin")
  await expect(page.getByRole("heading", { name: "Admin overview" })).toBeVisible()
  await expect(page.getByText("member@example.com")).toBeVisible()
  await expect(page.getByText("subscription.activate")).toBeVisible()
  await expect(page.getByRole("button", { name: "Activate 30d" })).toBeVisible()
})
