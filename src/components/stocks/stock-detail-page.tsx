"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { StockLineChart } from "@/components/charts/line-chart"
import { VolumeBarChart } from "@/components/charts/bar-chart"
import { BrokerFlowAnalysis } from "@/components/stocks/broker-flow-analysis"
import { LiquidityMetricsCard } from "@/components/stocks/liquidity-metrics-card"
import { stocksService, type TickerDetailParams } from "@/services/stocks"
import type { TickerDetail, PriceChartRange, StockAnalyze, BrokerSummaryEntry } from "@/types"
import { formatPercent, formatBigNumber, formatIDR } from "@/lib/utils"
import { brokerCodeClassName } from "@/lib/broker-display"
import { addDays, format, parseISO } from "date-fns"
import { ArrowLeft, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState, useEffect, useRef, useMemo } from "react"

const RANGES: { key: PriceChartRange; label: string }[] = [
  { key: "1m", label: "1M" },
  { key: "3m", label: "3M" },
  { key: "1y", label: "1Y" },
]

const FLOW_GROUPS = [
  { key: "FOREIGN", label: "ASING", color: "#3b82f6" },
  { key: "RETAIL", label: "RITEL", color: "#ef4444" },
  { key: "INSTITUTIONAL", label: "INSTITUSI", color: "#a855f7" },
  { key: "LOCAL_MID", label: "LOKAL MENENGAH", color: "#14b8a6" },
] as const

type BrokerFilterMode = "latest" | "7d" | "30d" | "3m" | "custom"

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}

interface StockDetailPageProps {
  ticker: string
}

function mergeWeightedAveragePrice(currentPrice: number, currentValue: number, nextPrice: number, nextValue: number) {
  const currentQuantity = currentPrice > 0 ? Math.abs(currentValue) / currentPrice : 0
  const nextQuantity = nextPrice > 0 ? Math.abs(nextValue) / nextPrice : 0
  const totalQuantity = currentQuantity + nextQuantity
  if (totalQuantity === 0) return 0

  const pricedValue = (currentPrice > 0 ? Math.abs(currentValue) : 0) + (nextPrice > 0 ? Math.abs(nextValue) : 0)
  return pricedValue / totalQuantity
}

export function StockDetailPage({ ticker }: StockDetailPageProps) {
  const [detail, setDetail] = useState<TickerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<PriceChartRange>("1m")
  const [rangeLoading, setRangeLoading] = useState(false)
  const [brokerDate, setBrokerDate] = useState<string>("")
  const [presetFromTo, setPresetFromTo] = useState<{ from: string; to: string } | null>(null)
  const [brokerFilterMode, setBrokerFilterMode] = useState<BrokerFilterMode>("latest")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [selectedFlowGroups, setSelectedFlowGroups] = useState<string[]>([])
  const [detailError, setDetailError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const [analyze, setAnalyze] = useState<StockAnalyze | null>(null)
  const [analyzeLoading, setAnalyzeLoading] = useState(true)
  const didInitialLoad = useRef(false)

  useEffect(() => {
    let active = true
    setDetailError(null)
    if (!didInitialLoad.current) setLoading(true)
    else setRangeLoading(true)
    const params: TickerDetailParams = presetFromTo ?? { range }
    stocksService
      .getTickerDetail(ticker.toUpperCase(), params)
      .then((d: TickerDetail) => {
        if (!active) return
        setDetail(d.price_chart.length > 0 ? d : null)
      })
      .catch(() => {
        if (active) {
          setDetail(null)
          setDetailError("Gagal memuat data detail saham. Periksa koneksi ke server, lalu coba lagi.")
        }
      })
      .finally(() => {
        if (active) {
          didInitialLoad.current = true
          setLoading(false)
          setRangeLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [ticker, range, presetFromTo, retry])

  useEffect(() => {
    let active = true
    setAnalyzeLoading(true)
    stocksService
      .getStockAnalyze(ticker.toUpperCase())
      .then((a: StockAnalyze) => {
        if (!active) return
        setAnalyze(a)
      })
      .catch(() => {
        if (active) setAnalyze(null)
      })
      .finally(() => {
        if (active) setAnalyzeLoading(false)
      })
    return () => {
      active = false
    }
  }, [ticker])

  const brokerDates = useMemo(
    () => Array.from(new Set((detail?.broker_summary ?? []).map((b) => b.trade_date))).sort().reverse(),
    [detail]
  )

  const brokerByDate = useMemo(() => {
    const map = new Map<string, BrokerSummaryEntry[]>()
    for (const row of detail?.broker_summary ?? []) {
      const list = map.get(row.trade_date)
      if (list) list.push(row)
      else map.set(row.trade_date, [row])
    }
    return map
  }, [detail])

  const flowByDate = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    for (const row of detail?.broker_summary ?? []) {
      const group = row.broker_group?.toUpperCase()
      if (!group) continue
      const values = map.get(row.trade_date) ?? {}
      values[group] = (values[group] ?? 0) + row.net_value
      map.set(row.trade_date, values)
    }
    return map
  }, [detail])

  const availableFlowGroups = useMemo(
    () => new Set(Array.from(flowByDate.values()).flatMap((values) => Object.keys(values))),
    [flowByDate]
  )

  // Preserve the selected broker date across refetches while it is still valid in the
  // new window; only fall back to the newest date when the current selection no longer
  // exists (e.g. a preset/range narrowed the window past it).
  useEffect(() => {
    if (brokerDate && !brokerDates.includes(brokerDate)) {
      setBrokerDate(brokerDates[0] ?? "")
    }
  }, [brokerDates, brokerDate])

  if (!loading && !detail) {
    if (detailError) {
      return (
        <div className="space-y-6">
          <Link href="/stocks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Stocks
          </Link>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-sm font-medium text-destructive">{detailError}</div>
              <Button variant="outline" onClick={() => setRetry((r) => r + 1)}>
                Coba lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return notFound()
  }
  if (!detail) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
      </div>
    )
  }

  const lastPoint = detail.price_chart[detail.price_chart.length - 1]
  const priceHistory = detail.price_chart.map((p) => ({
    trade_date: p.trade_date,
    displayDate: p.trade_date.slice(8, 10) + "/" + p.trade_date.slice(5, 7),
    value: p.close,
    ...flowByDate.get(p.trade_date),
  }))
  const volumeData = detail.volume_by_broker
    .slice()
    .sort((a, b) => b.buy_volume + b.sell_volume - (a.buy_volume + a.sell_volume))
    .slice(0, 8)
    .map((b) => ({ name: b.broker_name, buy: b.buy_volume, sell: b.sell_volume }))
  const activeBrokerDate = brokerDates.includes(brokerDate) ? brokerDate : brokerDates[0]
  const brokerRows = (() => {
    const source = detail.broker_summary
    if (brokerFilterMode === "latest") {
      return source
        .filter((b) => b.trade_date === activeBrokerDate)
        .sort((a, b) => Math.abs(b.net_value) - Math.abs(a.net_value))
    }

    const byBroker = new Map<string, BrokerSummaryEntry>()
    for (const row of source) {
      const current = byBroker.get(row.broker_code)
      if (!current) {
        byBroker.set(row.broker_code, { ...row })
        continue
      }
      const buyAvgPrice = mergeWeightedAveragePrice(current.buy_avg_price, current.buy_value, row.buy_avg_price, row.buy_value)
      const sellAvgPrice = mergeWeightedAveragePrice(current.sell_avg_price, current.sell_value, row.sell_avg_price, row.sell_value)
      current.buy_lot += row.buy_lot
      current.sell_lot += row.sell_lot
      current.buy_volume += row.buy_volume
      current.sell_volume += row.sell_volume
      current.buy_value += row.buy_value
      current.sell_value += row.sell_value
      current.net_value += row.net_value
      current.buy_avg_price = buyAvgPrice
      current.sell_avg_price = sellAvgPrice
      current.frequency += row.frequency
    }
    return Array.from(byBroker.values()).sort((a, b) => Math.abs(b.net_value) - Math.abs(a.net_value))
  })()
  const buyBrokerRows = brokerRows
    .filter((broker) => broker.buy_volume > 0 || broker.buy_value > 0)
    .slice()
    .sort((a, b) => b.buy_value - a.buy_value)
  const sellBrokerRows = brokerRows
    .filter((broker) => broker.sell_volume > 0 || broker.sell_value > 0)
    .slice()
    .sort((a, b) => b.sell_value - a.sell_value)

  // brokerDates tersortir descending (terbaru dulu). ◀ = ke hari sebelumnya (index +1), ▶ = hari berikutnya (index -1).
  const dateIndex = activeBrokerDate ? brokerDates.indexOf(activeBrokerDate) : -1
  const prevDate = dateIndex > -1 && dateIndex < brokerDates.length - 1 ? brokerDates[dateIndex + 1] : undefined
  const nextDate = dateIndex > 0 ? brokerDates[dateIndex - 1] : undefined

  const applyPreset = (days: number) => {
    const to = new Date()
    const from = addDays(to, -(days - 1))
    setPresetFromTo({ from: format(from, "yyyy-MM-dd"), to: format(to, "yyyy-MM-dd") })
    setBrokerFilterMode(days === 7 ? "7d" : days === 30 ? "30d" : "3m")
  }

  const applyCustomRange = () => {
    if (!customFrom || !customTo || customFrom > customTo) return
    setPresetFromTo({ from: customFrom, to: customTo })
    setBrokerFilterMode("custom")
  }

  const selectLatestDate = (date: string) => {
    setBrokerDate(date)
    setBrokerFilterMode("latest")
  }

  const brokerFilterLabel = brokerFilterMode === "latest"
    ? "Latest"
    : brokerFilterMode === "7d"
      ? "Last 7 Days"
      : brokerFilterMode === "30d"
        ? "Last 30 Days"
        : brokerFilterMode === "3m"
          ? "Last 3 Months"
          : "Custom Range"

  return (
    <div className="space-y-6">
      <Link href="/stocks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Stocks
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{detail.symbol}</h1>
          <p className="text-muted-foreground">{detail.stock_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">Rp{lastPoint.close.toLocaleString()}</span>
          <Badge variant={lastPoint.change_pct >= 0 ? "success" : "destructive"}>
            {lastPoint.change_pct >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {formatPercent(lastPoint.change_pct)}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="chart" className="flex-1 sm:flex-none">Price Chart</TabsTrigger>
          <TabsTrigger value="brokers" className="flex-1 sm:flex-none">Broker Summary</TabsTrigger>
          <TabsTrigger value="analyze" className="flex-1 sm:flex-none">Analisis Broker Flow</TabsTrigger>
          <TabsTrigger value="liquidity" className="flex-1 sm:flex-none">Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>{detail.from} – {detail.to}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {RANGES.map((r) => (
                  <Button
                    key={r.key}
                    size="sm"
                    variant={!presetFromTo && range === r.key ? "default" : "outline"}
                    onClick={() => {
                      setRange(r.key)
                      setPresetFromTo(null)
                    }}
                    disabled={rangeLoading}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border p-3">
                <span className="text-xs font-medium text-muted-foreground">Flow:</span>
                {FLOW_GROUPS.map((group) => (
                  <label key={group.key} className={`flex items-center gap-2 text-xs ${availableFlowGroups.has(group.key) ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-current"
                      checked={selectedFlowGroups.includes(group.key)}
                      disabled={!availableFlowGroups.has(group.key)}
                      onChange={(event) => setSelectedFlowGroups((current) => (
                        event.target.checked
                          ? [...current, group.key]
                          : current.filter((key) => key !== group.key)
                      ))}
                    />
                    <span style={{ color: group.color }}>{group.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Price chart flow legend">
                <span className="font-medium">Legend:</span>
                {FLOW_GROUPS.map((group) => (
                  <span key={group.key} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} aria-hidden="true" />
                    {group.label}
                  </span>
                ))}
              </div>
              {rangeLoading ? (
                <Skeleton className="h-[350px] w-full rounded-lg" />
              ) : (
                <StockLineChart
                  data={priceHistory}
                  xKey="displayDate"
                  height={350}
                  color="#a1a1aa"
                  secondarySeries={selectedFlowGroups.map((key) => {
                    const group = FLOW_GROUPS.find((item) => item.key === key)!
                    return { dataKey: key, name: group.label, color: group.color }
                  })}
                  customTooltip={(p) => {
                    if (!p.active || !p.payload?.length) return null
                    const point = p.payload[0].payload as { trade_date: string; value: number }
                    const rows = brokerByDate.get(point.trade_date) ?? []
                    const buyers = rows.filter((row) => row.buy_value > 0).sort((a, b) => b.buy_value - a.buy_value).slice(0, 3)
                    const sellers = rows.filter((row) => row.sell_value > 0).sort((a, b) => b.sell_value - a.sell_value).slice(0, 3)
                    return (
                      <div className="p-3 shadow-md">
                        <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-border pb-2">
                          <span className="text-xs font-medium text-muted-foreground">{point.trade_date}</span>
                          <span className="text-sm font-semibold">Rp{point.value.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-muted-foreground">Top Buyers</div>
                            {buyers.length === 0 ? (
                              <div className="text-xs text-muted-foreground">No data</div>
                            ) : (
                              buyers.map((b) => (
                                <div key={`buy-${b.broker_code}`} className="space-y-0.5">
                                  <div className="text-xs font-medium leading-tight">{b.broker_name}</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {b.broker_group || b.broker_type} · <span className={brokerCodeClassName(b.broker_group, b.broker_type)}>{b.broker_code}</span>
                                  </div>
                                  <div className="text-xs font-semibold text-emerald-500">
                                    {formatIDR(b.buy_value)} · {formatBigNumber(b.buy_volume)}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-muted-foreground">Top Sellers</div>
                            {sellers.length === 0 ? (
                              <div className="text-xs text-muted-foreground">No data</div>
                            ) : (
                              sellers.map((b) => (
                                <div key={`sell-${b.broker_code}`} className="space-y-0.5">
                                  <div className="text-xs font-medium leading-tight">{b.broker_name}</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {b.broker_group || b.broker_type} · <span className={brokerCodeClassName(b.broker_group, b.broker_type)}>{b.broker_code}</span>
                                  </div>
                                  <div className="text-xs font-semibold text-red-500">
                                    {formatIDR(b.sell_value)} · {formatBigNumber(b.sell_volume)}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              )}
            </CardContent>
          </Card>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Volume Distribution</CardTitle>
                <CardDescription>Top brokers by traded volume</CardDescription>
              </CardHeader>
              <CardContent>
                <VolumeBarChart data={volumeData} height={300} />
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="brokers">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => prevDate && selectLatestDate(prevDate)}
                    disabled={!prevDate || brokerFilterMode !== "latest"}
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-[150px] justify-between">
                        {brokerFilterLabel}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-[280px] overflow-y-auto">
                      <DropdownMenuItem onSelect={() => brokerDates[0] && selectLatestDate(brokerDates[0])}>
                        Latest
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => applyPreset(7)}>
                        Last 7 Days
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => applyPreset(30)}>
                        Last 30 Days
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => applyPreset(90)}>
                        Last 3 Months
                      </DropdownMenuItem>
                      {brokerDates.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Go to date
                          </div>
                          {brokerDates.slice(0, 15).map((date) => (
                            <DropdownMenuItem
                              key={date}
                              onSelect={() => selectLatestDate(date)}
                              className={date === activeBrokerDate ? "bg-accent" : undefined}
                            >
                              {date}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => nextDate && selectLatestDate(nextDate)}
                    disabled={!nextDate || brokerFilterMode !== "latest"}
                    aria-label="Next day"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {presetFromTo && brokerFilterMode !== "latest" && (
                    <Badge variant="outline" className="ml-2">
                      {presetFromTo.from} – {presetFromTo.to}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="space-y-1 text-xs text-muted-foreground">
                    <span className="block">Start</span>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(event) => setCustomFrom(event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                    />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    <span className="block">End</span>
                    <input
                      type="date"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={(event) => setCustomTo(event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                    />
                  </label>
                  <Button variant="outline" size="sm" onClick={applyCustomRange} disabled={!customFrom || !customTo || customFrom > customTo}>
                    Apply
                  </Button>
                </div>
                <div>
                  <CardTitle>Broker Summary</CardTitle>
                  <CardDescription>Brokers trading {detail.symbol}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {brokerDates.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Tidak ada data broker summary untuk {detail.symbol} pada periode ini.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60">
                    <div className="border-b border-border/60 px-4 py-3">
                      <h3 className="text-sm font-semibold text-emerald-500">Broker Buy</h3>
                      <p className="text-xs text-muted-foreground">Diurutkan berdasarkan nilai beli</p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[560px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Broker</TableHead>
                            <TableHead className="text-right">B LOT</TableHead>
                            <TableHead className="text-right">B FREQ</TableHead>
                            <TableHead className="text-right">B AVG</TableHead>
                            <TableHead className="text-right">B VAL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {buyBrokerRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                Tidak ada data buy
                              </TableCell>
                            </TableRow>
                          ) : (
                            buyBrokerRows.map((broker) => (
                              <TableRow key={broker.broker_code}>
                                <TableCell>
                                  <div className="font-medium">{broker.broker_name}</div>
                                  <div className="text-xs text-muted-foreground">{broker.broker_group || broker.broker_type} · <span className={brokerCodeClassName(broker.broker_group, broker.broker_type)}>{broker.broker_code}</span></div>
                                </TableCell>
                                <TableCell className="text-right">{formatBigNumber(broker.buy_lot)}</TableCell>
                                <TableCell className="text-right">{broker.buy_frequency == null ? "—" : broker.buy_frequency.toLocaleString("id-ID")}</TableCell>
                                <TableCell className="text-right">{broker.buy_avg_price > 0 ? formatIDR(broker.buy_avg_price) : "—"}</TableCell>
                                <TableCell className="text-right">Rp{formatBigNumber(broker.buy_value)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60">
                    <div className="border-b border-border/60 px-4 py-3">
                      <h3 className="text-sm font-semibold text-red-500">Broker Sell</h3>
                      <p className="text-xs text-muted-foreground">Diurutkan berdasarkan nilai jual</p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[560px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Broker</TableHead>
                            <TableHead className="text-right">S LOT</TableHead>
                            <TableHead className="text-right">S FREQ</TableHead>
                            <TableHead className="text-right">S AVG</TableHead>
                            <TableHead className="text-right">S VAL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sellBrokerRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                Tidak ada data sell
                              </TableCell>
                            </TableRow>
                          ) : (
                            sellBrokerRows.map((broker) => (
                              <TableRow key={broker.broker_code}>
                                <TableCell>
                                  <div className="font-medium">{broker.broker_name}</div>
                                  <div className="text-xs text-muted-foreground">{broker.broker_group || broker.broker_type} · <span className={brokerCodeClassName(broker.broker_group, broker.broker_type)}>{broker.broker_code}</span></div>
                                </TableCell>
                                <TableCell className="text-right">{formatBigNumber(broker.sell_lot)}</TableCell>
                                <TableCell className="text-right">{broker.sell_frequency == null ? "—" : broker.sell_frequency.toLocaleString("id-ID")}</TableCell>
                                <TableCell className="text-right">{broker.sell_avg_price > 0 ? formatIDR(broker.sell_avg_price) : "—"}</TableCell>
                                <TableCell className="text-right">Rp{formatBigNumber(broker.sell_value)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze">
          {analyzeLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : analyze && analyze.total_brokers > 0 ? (
            <BrokerFlowAnalysis analyze={analyze} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Belum ada data analisis broker flow untuk {detail.symbol}.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="liquidity">
          <LiquidityMetricsCard ticker={detail.symbol} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
