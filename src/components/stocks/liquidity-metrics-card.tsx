"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { stocksService } from "@/services/stocks"
import { formatBigNumber } from "@/lib/utils"
import type { LiquidityMetrics } from "@/types"

interface LiquidityMetricsCardProps {
  ticker: string
}

function MetricRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="text-right text-sm font-bold tabular-nums">{value}</div>
    </div>
  )
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "N/A"
  const percent = value * 100
  if (percent === 0) return "0.0%"
  if (Math.abs(percent) >= 0.05) return `${percent.toFixed(1)}%`

  const decimals = Math.min(6, Math.max(2, Math.ceil(-Math.log10(Math.abs(percent))) + 1))
  const formatted = percent.toFixed(decimals)
  if (Number(formatted) !== 0) return `${formatted}%`
  return percent > 0 ? "<0.000001%" : ">-0.000001%"
}

function formatLargeMetric(value: number | null | undefined, formatted: string | null | undefined): string {
  if (formatted?.trim()) return formatted
  if (value == null || !Number.isFinite(value)) return "N/A"
  return formatBigNumber(value)
}

export function LiquidityMetricsCard({ ticker }: LiquidityMetricsCardProps) {
  const [data, setData] = useState<LiquidityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await stocksService.getLiquidityMetrics(ticker)
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat data liquidity metrics")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [ticker])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liquidity &amp; Market Structure</CardTitle>
          <CardDescription>Memuat data metrics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liquidity &amp; Market Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liquidity &amp; Market Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tidak ada data metrics untuk saham ini.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity &amp; Market Structure</CardTitle>
        <CardDescription>
          As of {data.trade_date} | Close Rp{data.close_price.toLocaleString()} | Listed Shares: {data.listed_shares.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ADTV Section */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Average Daily Traded Value (ADTV)</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricRow label="20D" value={formatLargeMetric(data.adtv_20d, data.adtv_20d_formatted)} />
            <MetricRow label="3M" value={formatLargeMetric(data.adtv_3m, data.adtv_3m_formatted)} />
            <MetricRow label="6M" value={formatLargeMetric(data.adtv_6m, data.adtv_6m_formatted)} />
            <MetricRow label="12M" value={formatLargeMetric(data.adtv_12m, data.adtv_12m_formatted)} />
          </div>
        </div>

        {/* Trading Frequency Section */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Trading Frequency</h4>
          <div className="grid grid-cols-2 gap-2">
            <MetricRow label="3M" value={formatPercent(data.trading_freq_3m)} hint="Hari traded / Market days" />
            <MetricRow label="12M" value={formatPercent(data.trading_freq_12m)} hint="Hari traded / Market days" />
          </div>
        </div>

        {/* Turnover Ratio Section */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Turnover Ratio</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MetricRow label="1D" value={formatPercent(data.turnover_1d)} />
            <MetricRow label="Avg 20D" value={formatPercent(data.avg_turnover_20d)} />
            <MetricRow label="Avg 3M" value={formatPercent(data.avg_turnover_3m)} />
            <MetricRow label="Avg 6M" value={formatPercent(data.avg_turnover_6m)} />
            <MetricRow label="Avg 12M" value={formatPercent(data.avg_turnover_12m)} />
          </div>
        </div>

        {/* Market Cap Section */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Market Capitalization</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <MetricRow
              label="Full Market Cap"
              value={formatLargeMetric(data.full_market_cap, data.full_market_cap_formatted)}
              hint={`Close × Listed Shares`}
            />
            <MetricRow
              label="Free-Float Market Cap"
              value={formatLargeMetric(data.free_float_market_cap, data.free_float_market_cap_formatted)}
              hint={`FF ${data.free_float_pct}% (current)`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
