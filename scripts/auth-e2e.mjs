import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const playwrightModule = process.env.PLAYWRIGHT_MODULE || path.resolve(scriptDir, "../../tools/stockbit-auth/node_modules/playwright")
const require = createRequire(import.meta.url)
const { chromium } = require(playwrightModule)
const frontendURL = process.env.E2E_FRONTEND_URL || "http://localhost:3000"
const mailpitURL = (process.env.MAILPIT_URL || "http://localhost:8025").replace(/\/$/, "")
const unique = Date.now().toString()
const user = {
  name: "QA Auth User",
  phone: `0812${unique.slice(-8)}`,
  email: `qa-${unique}@yappingsaham.test`,
  address: "Jl. QA Automation No. 1, Jakarta",
  password: "SecurePass123!",
}

async function waitForOTP(page) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    const response = await fetch(`${mailpitURL}/api/v1/search?query=${encodeURIComponent(`to:${user.email}`)}`)
    if (response.ok) {
      const search = await response.json()
      const message = search.messages?.[0]
      if (message?.ID) {
        const detail = await fetch(`${mailpitURL}/api/v1/message/${message.ID}`)
        if (detail.ok) {
          const body = await detail.json()
          const match = `${body.Text || ""} ${body.HTML || ""}`.match(/\b\d{6}\b/)
          if (match) return match[0]
        }
      }
    }
    await page.waitForTimeout(1000)
  }
  throw new Error(`OTP email was not received for ${user.email}`)
}

const browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" })
const page = await browser.newPage()
try {
  await page.goto(`${frontendURL}/register`, { waitUntil: "domcontentloaded" })
  await page.getByLabel("Name").fill(user.name)
  await page.getByLabel("Phone number").fill(user.phone)
  await page.getByLabel("Email").fill(user.email)
  await page.getByLabel("Address").fill(user.address)
  await page.getByLabel("Password", { exact: true }).fill(user.password)
  await page.getByLabel("Confirm password").fill(user.password)
  await page.getByRole("button", { name: "Create profile" }).click()
  await page.getByText("Verify your email").waitFor()
  const otp = await waitForOTP(page)
  await page.getByLabel("Verification code").fill(otp)
  await page.getByRole("button", { name: "Verify email" }).click()
  await page.getByText("Registration complete").waitFor()
  await page.getByRole("link", { name: "Continue to sign in" }).click()
  await page.getByLabel("Email").fill(user.email)
  await page.getByLabel("Password").fill(user.password)
  await page.getByRole("button", { name: "Sign In" }).click()
  await page.waitForURL(/\/dashboard$/)
  console.log(`AUTH_E2E_PASSED email=${user.email}`)
} finally {
  await browser.close()
}
