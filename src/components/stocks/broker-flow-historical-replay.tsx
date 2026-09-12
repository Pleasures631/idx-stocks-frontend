"use client"

import { useMemo, useState } from "react"
import { format, parseISO, subDays } from "date-fns"
import { CalendarClock, Play } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatBigNumber } from "@/lib/utils"
import { stocksService } from "@/services/stocks"
import type { StockAnalyze } from "@/types"
import { getBrokerFlowStatus } from "./broker-flow-status"

const DEFAULT_SNAPSHOT_DATES = ["2026-05-11", "2026-05-25", "2026-06-02"]

interface ReplayResult {
  date: string
  from: string
  analyze: StockAnalyze | null
  error?: string
}

function weekStart(date: string) {
  return format(subDays(parseISO(date), 6), "yyyy-MM-dd")
}

function snapshotLabel(analyze: StockAnalyze) {
  return getBrokerFlowStatus(analyze).label
}

function snapshotVariant(analyze: StockAnalyze): "success" | "warning" | "destructive" | "secondary" {
  return getBrokerFlowStatus(analyze).variant
}

function formatGroupValue(value: number | undefined) {
  return value == null ? "—" : formatBigNumber(value)
}

function SnapshotCard({ result }: { result: ReplayResult }) {
  if (result.error) {
    return (
      <Card>
        <CardHeader><CardTitle>{result.date}</CardTitle><CardDescription>{result.from} – {result.date}</CardDescription></CardHeader>
        <CardContent className="text-sm text-destructive">{result.error}</CardContent>
      </Card>
    )
  }

  if (!result.analyze) {
    return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Belum dijalankan</CardContent></Card>
  }

  const analyze = result.analyze
  const buyers = (analyze.brokers_accumulation ?? []).slice(0, 3)
  const sellers = (analyze.brokers_distribution ?? []).slice(0, 3)

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>{result.date}</CardTitle>
            <CardDescription>{analyze.coverage?.effective_start_date ?? result.from} – {analyze.coverage?.effective_end_date ?? result.date}</CardDescription>
          </div>
          <Badge variant={snapshotVariant(analyze)}>{snapshotLabel(analyze)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyze.dominant_flow && <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3 text-sm"><span className="text-muted-foreground">Dominant broker: </span><strong>{analyze.dominant_flow.broker_code} {analyze.dominant_flow.direction === "ACCUMULATION" ? "BUY" : "SELL"}</strong><span className="ml-2 text-muted-foreground">{analyze.dominant_flow.formatted_net_value}</span></div>}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3">
            <div className="text-xs text-muted-foreground">Retail Net</div>
            <div className="font-semibold">{formatGroupValue(analyze.retail_net)}</div>
          </div>
          <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
            <div className="text-xs text-muted-foreground">Big Money Net</div>
            <div className="font-semibold">{formatGroupValue(analyze.big_money_net)}</div>
          </div>
        </div>

        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <div className="mb-1 font-medium text-muted-foreground">Top BUY</div>
            <div className="space-y-1">{buyers.length > 0 ? buyers.map((broker) => <div key={broker.broker_code} className="flex justify-between gap-2"><span>{broker.broker_code}</span><span className="text-emerald-600">{broker.formatted_net_value}</span></div>) : <span className="text-muted-foreground">Tidak ada data</span>}</div>
          </div>
          <div>
            <div className="mb-1 font-medium text-muted-foreground">Top SELL</div>
            <div className="space-y-1">{sellers.length > 0 ? sellers.map((broker) => <div key={broker.broker_code} className="flex justify-between gap-2"><span>{broker.broker_code}</span><span className="text-red-600">{broker.formatted_net_value}</span></div>) : <span className="text-muted-foreground">Tidak ada data</span>}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BrokerFlowHistoricalReplay({ symbol }: { symbol: string }) {
  const [dates, setDates] = useState(DEFAULT_SNAPSHOT_DATES)
  const [results, setResults] = useState<ReplayResult[]>([])
  const [loading, setLoading] = useState(false)

  const validDates = useMemo(() => dates.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)), [dates])

  async function runReplay() {
    if (!validDates || loading) return
    setLoading(true)
    const nextResults = await Promise.all(dates.map(async (date): Promise<ReplayResult> => {
      const from = weekStart(date)
      try {
        const analyze = await stocksService.getStockAnalyze(symbol.toUpperCase(), { from, to: date })
        return { date, from, analyze }
      } catch {
        return { date, from, analyze: null, error: "Data broker flow tidak tersedia untuk window ini." }
      }
    }))
    setResults(nextResults)
    setLoading(false)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-muted-foreground" /><CardTitle>Replay Historical Broker Flow</CardTitle></div>
        <CardDescription>Simulasi pembacaan indikator pada tanggal lampau. Setiap snapshot memakai window 7 hari sampai tanggal tersebut; ini bukan prediksi dan tidak memakai data setelah snapshot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {dates.map((date, index) => (
            <label key={index} className="space-y-1 text-xs text-muted-foreground">
              <span>Snapshot {index + 1}</span>
              <Input type="date" value={date} onChange={(event) => setDates((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />
            </label>
          ))}
        </div>
        <Button onClick={runReplay} disabled={!validDates || loading}>
          <Play className="mr-2 h-4 w-4" />{loading ? "Membaca snapshot..." : "Jalankan replay"}
        </Button>
        {results.length > 0 && <div className="grid gap-4 lg:grid-cols-3">{results.map((result) => <SnapshotCard key={`${result.date}-${result.from}`} result={result} />)}</div>}
      </CardContent>
    </Card>
  )
}
