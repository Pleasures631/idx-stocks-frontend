import { chromium } from "@playwright/test"
import { pathToFileURL } from "node:url"

export const brokerFlowSweepVariants = [
  ["baseline-default", 0.60, 0.05, 0.40],
  ["loose-40-01-20", 0.40, 0.01, 0.20],
  ["loose-40-02-30", 0.40, 0.02, 0.30],
  ["loose-50-02-30", 0.50, 0.02, 0.30],
  ["loose-50-03-35", 0.50, 0.03, 0.35],
  ["consistency-40", 0.40, 0.05, 0.40],
  ["consistency-50", 0.50, 0.05, 0.40],
  ["consistency-70", 0.70, 0.05, 0.40],
  ["consistency-80", 0.80, 0.05, 0.40],
  ["intensity-01", 0.60, 0.01, 0.40],
  ["intensity-02", 0.60, 0.02, 0.40],
  ["intensity-03", 0.60, 0.03, 0.40],
  ["intensity-08", 0.60, 0.08, 0.40],
  ["intensity-10", 0.60, 0.10, 0.40],
  ["same-sign-20", 0.60, 0.05, 0.20],
  ["same-sign-30", 0.60, 0.05, 0.30],
  ["same-sign-50", 0.60, 0.05, 0.50],
  ["same-sign-60", 0.60, 0.05, 0.60],
  ["strict-70-08-50", 0.70, 0.08, 0.50],
  ["strict-80-10-60", 0.80, 0.10, 0.60],
].map(([name, consistency, intensity, sameSign], index) => ({
  number: index + 1,
  name,
  consistency,
  intensity,
  sameSign,
}))

function usage(commandName = "run-broker-flow-browser-sweep.mjs") {
  return `Usage: node scripts/${commandName} [options]

Options:
  --ticker <code>     Ticker tunggal (default: CUAN)
  --start <YYYY-MM-DD> Tanggal awal sinyal (default: 2026-05-01)
  --end <YYYY-MM-DD>   Tanggal akhir sinyal (default: 2026-09-12)
  --as-of <YYYY-MM-DD> Cutoff opsional
  --base-url <url>    URL dashboard (default: http://127.0.0.1:3000)
  --headless          Jalankan tanpa jendela browser
  --help              Tampilkan bantuan`
}

function parseArgs(argv, { direction = "ACCUMULATION", commandName = "run-broker-flow-browser-sweep.mjs" } = {}) {
  const options = {
    ticker: "CUAN",
    start: "2026-05-01",
    end: "2026-09-12",
    asOf: "",
    baseUrl: "http://127.0.0.1:3000",
    headless: false,
    direction,
  }
  const keys = new Map([
    ["--ticker", "ticker"],
    ["--start", "start"],
    ["--end", "end"],
    ["--as-of", "asOf"],
    ["--base-url", "baseUrl"],
  ])
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === "--help") {
      process.stdout.write(`${usage(commandName)}\n`)
      process.exit(0)
    }
    if (argument === "--headless") {
      options.headless = true
      continue
    }
    const key = keys.get(argument)
    if (!key || !argv[index + 1]) throw new Error(`Argumen tidak valid: ${argument}\n${usage(commandName)}`)
    options[key] = argv[index + 1]
    index += 1
  }
  options.ticker = options.ticker.trim().toUpperCase()
  options.baseUrl = options.baseUrl.replace(/\/$/, "")
  return options
}

function validateOptions(options) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!/^[A-Z0-9]{1,12}$/.test(options.ticker)) throw new Error("Ticker harus 1-12 karakter A-Z/0-9.")
  if (!["ACCUMULATION", "DISTRIBUTION"].includes(options.direction)) throw new Error("Arah sweep tidak valid.")
  const parsedDates = {}
  for (const [label, value] of [["start", options.start], ["end", options.end]]) {
    if (!datePattern.test(value)) throw new Error(`--${label} wajib berformat YYYY-MM-DD.`)
    const parsed = new Date(`${value}T00:00:00Z`)
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new Error(`--${label} bukan tanggal kalender yang valid.`)
    }
    parsedDates[label] = parsed
  }
  if (options.asOf) {
    if (!datePattern.test(options.asOf)) throw new Error("--as-of wajib berformat YYYY-MM-DD.")
    const parsedAsOf = new Date(`${options.asOf}T00:00:00Z`)
    if (Number.isNaN(parsedAsOf.valueOf()) || parsedAsOf.toISOString().slice(0, 10) !== options.asOf) {
      throw new Error("--as-of bukan tanggal kalender yang valid.")
    }
  }
  if (options.start > options.end) throw new Error("Tanggal --end tidak boleh sebelum --start.")
  if (parsedDates.end - parsedDates.start > 366 * 24 * 60 * 60 * 1000) throw new Error("Rentang tanggal maksimal 366 hari.")
  if (options.asOf && options.asOf < options.end) throw new Error("Tanggal --as-of tidak boleh sebelum --end.")
  try {
    const baseUrl = new URL(options.baseUrl)
    if (!(["http:", "https:"].includes(baseUrl.protocol))) throw new Error()
  } catch {
    throw new Error("--base-url bukan URL yang valid.")
  }
}

async function ensureChecked(locator) {
  if (!(await locator.isChecked())) await locator.check()
}

export async function runBrokerFlowSweep(page, options, log = (message) => process.stdout.write(`${message}\n`)) {
  options = { direction: "ACCUMULATION", ...options }
  validateOptions(options)
  const directionLabel = options.direction === "DISTRIBUTION" ? "Distribusi" : "Akumulasi"
  let batchId = ""
  page.setDefaultTimeout(30_000)
  await page.goto(`${options.baseUrl}/broker-flow-backtest`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { name: "Broker Flow Backtest" }).waitFor()

  await page.getByLabel("Ticker").fill(options.ticker)
  await page.getByLabel("Tanggal awal sinyal").fill(options.start)
  await page.getByLabel("Tanggal akhir sinyal").fill(options.end)
  if (options.asOf) await page.getByLabel("As-of date (opsional)").fill(options.asOf)
  await page.getByLabel("Lookback sesi").fill("20")

  await page.getByLabel("Arah sinyal").click()
  await page.getByRole("option", { name: directionLabel, exact: true }).click()
  for (const horizon of [1, 5, 10, 20]) {
    await ensureChecked(page.getByRole("checkbox", { name: `${horizon}D` }))
  }

  await page.getByText("Advanced thresholds").click()
  await page.getByLabel("Simpan hasil ke DB").check()

  for (const variant of brokerFlowSweepVariants) {
    await page.getByLabel("Min consistency").fill(String(variant.consistency))
    await page.getByLabel("Min intensity").fill(String(variant.intensity))
    await page.getByLabel("Min same-sign share").fill(String(variant.sameSign))
    await page.getByLabel("Nomor variasi").fill(String(variant.number))
    await page.getByLabel("Nama variasi").fill(variant.name)
    await page.getByLabel("Batch ID (opsional)").fill(batchId)

    const responsePromise = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/v2/backtests/broker-flow",
      { timeout: 180_000 },
    )
    await page.getByRole("button", { name: "Jalankan backtest" }).click()
    const response = await responsePromise
    let payload
    try {
      payload = await response.json()
    } catch {
      throw new Error(`Variasi ${variant.number} menerima respons non-JSON (HTTP ${response.status()}).`)
    }
    if (!response.ok() || !payload?.success) {
      const uiError = await page.getByRole("alert").textContent().catch(() => "")
      throw new Error(`Variasi ${variant.number} gagal (HTTP ${response.status()}): ${payload?.message || uiError || "unknown error"}`)
    }

    await page.getByTestId("backtest-persisted-result").waitFor({ timeout: 180_000 })
    const returnedBatchId = (await page.getByTestId("persisted-batch-id").textContent())?.trim() || ""
    if (!/^[0-9a-f]{32}$/.test(returnedBatchId)) throw new Error(`Variasi ${variant.number} tidak mengembalikan batch ID valid.`)
    if (batchId && returnedBatchId !== batchId) throw new Error(`Batch ID berubah pada variasi ${variant.number}.`)
    batchId = returnedBatchId
    const rowsInserted = payload.data?.rows_inserted
    log(`[${variant.number}/20] ${variant.name} OK (${rowsInserted ?? "?"} rows)`)
  }

  return batchId
}

export async function runBrokerFlowSweepCli({
  direction = "ACCUMULATION",
  commandName = "run-broker-flow-browser-sweep.mjs",
} = {}) {
  const options = parseArgs(process.argv.slice(2), { direction, commandName })
  validateOptions(options)
  const browser = await chromium.launch({ headless: options.headless })
  try {
    const batchId = await runBrokerFlowSweep(await browser.newPage(), options)
    const directionLabel = options.direction === "DISTRIBUTION" ? "distribusi" : "akumulasi"
    process.stdout.write(`Selesai: 20 variasi ${directionLabel} untuk ${options.ticker}. Batch ID: ${batchId}\n`)
  } finally {
    await browser.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runBrokerFlowSweepCli().catch((error) => {
    process.stderr.write(`Broker-flow browser sweep gagal: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
