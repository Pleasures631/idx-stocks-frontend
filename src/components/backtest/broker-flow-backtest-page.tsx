"use client"

import { useState } from "react"
import { isAxiosError } from "axios"
import { format, subMonths } from "date-fns"
import { AlertTriangle, BarChart3, ChevronLeft, ChevronRight, FlaskConical, Info, Play } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatIDR } from "@/lib/utils"
import { brokerFlowBacktestSchema } from "@/lib/validators"
import { brokerFlowBacktestService } from "@/services/broker-flow-backtest"
import type {
  BrokerFlowBacktestDirection,
  BrokerFlowBacktestHorizon,
  BrokerFlowBacktestRequest,
  BrokerFlowBacktestResponse,
} from "@/types"

const ALL_HORIZONS: BrokerFlowBacktestHorizon[] = [1, 5, 10, 20]
const PAGE_SIZE = 50

function parseSymbols(value: string) {
  return Array.from(new Set(value.split(/[\s,;]+/).map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)))
}

function nullablePercent(value: number | null, digits = 2) {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`
}

function ratioPercent(value: number | null, digits = 1) {
  return value === null ? "—" : `${(value * 100).toFixed(digits)}%`
}

function metricTone(value: number | null) {
  if (value === null || value === 0) return ""
  return value > 0 ? "text-emerald-500" : "text-red-500"
}

function ResultSkeleton() {
  return (
    <div className="space-y-4" aria-label="Menjalankan backtest" aria-busy="true">
      <p className="text-sm text-muted-foreground" role="status">Menghitung sinyal dan forward outcome dari data historis...</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function BrokerFlowBacktestPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const [symbolInput, setSymbolInput] = useState("CUAN, BBCA, TLKM")
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 6), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(today)
  const [asOfDate, setAsOfDate] = useState("")
  const [lookback, setLookback] = useState(20)
  const [direction, setDirection] = useState<BrokerFlowBacktestDirection>("ACCUMULATION")
  const [horizons, setHorizons] = useState<BrokerFlowBacktestHorizon[]>(ALL_HORIZONS)
  const [minConsistency, setMinConsistency] = useState(0.6)
  const [minIntensity, setMinIntensity] = useState(0.05)
  const [minSameSignShare, setMinSameSignShare] = useState(0.4)
  const [maxResults, setMaxResults] = useState(500)
  const [persistResult, setPersistResult] = useState(false)
  const [batchId, setBatchId] = useState("")
  const [variantNumber, setVariantNumber] = useState(1)
  const [variantName, setVariantName] = useState("baseline-default")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BrokerFlowBacktestResponse | null>(null)
  const [page, setPage] = useState(1)

  const symbols = parseSymbols(symbolInput)
  const maxPage = data ? Math.max(1, Math.ceil(data.results.length / PAGE_SIZE)) : 1
  const visibleResults = data?.results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? []

  const toggleHorizon = (horizon: BrokerFlowBacktestHorizon) => {
    setHorizons((current) => current.includes(horizon)
      ? current.filter((item) => item !== horizon)
      : ALL_HORIZONS.filter((item) => item === horizon || current.includes(item)))
  }

  const runBacktest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const request: BrokerFlowBacktestRequest = {
      symbols,
      start_date: startDate,
      end_date: endDate,
      ...(asOfDate ? { as_of_date: asOfDate } : {}),
      lookback_sessions: lookback,
      horizons,
      min_consistency: minConsistency,
      min_intensity: minIntensity,
      min_same_sign_share: minSameSignShare,
      direction,
      max_results: maxResults,
      persist_result: persistResult,
      ...(persistResult && batchId ? { batch_id: batchId.trim() } : {}),
      ...(persistResult ? { variant_number: variantNumber, variant_name: variantName.trim() } : {}),
    }
    const validation = brokerFlowBacktestSchema.safeParse(request)
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Konfigurasi backtest belum valid.")
      return
    }

    setLoading(true)
    setError(null)
    setData(null)
    setPage(1)
    try {
      const result = await brokerFlowBacktestService.run(request)
      if (persistResult && result.persisted && result.batch_id) {
        setBatchId(result.batch_id)
      }
      setData(result)
    } catch (caught) {
      const message = isAxiosError<{ message?: string }>(caught)
        ? caught.response?.data?.message
        : caught instanceof Error ? caught.message : undefined
      setError(message || "Backtest gagal dijalankan. Periksa parameter dan koneksi server, lalu coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <FlaskConical className="h-4 w-4" />
          Historical signal evaluation
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Broker Flow Backtest</h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          Uji sinyal dominant broker dengan data yang tersedia pada setiap tanggal sinyal. Entry memakai harga open sesi IDX berikutnya dan outcome tidak melewati as-of date.
        </p>
      </header>

      <Card className="border-amber-500/50 bg-amber-500/5" role="note">
        <CardContent className="flex gap-3 pt-6 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Alat riset, bukan sinyal transaksi atau jaminan hasil.</p>
            <p className="mt-1 text-muted-foreground">Data Exodus terbatas pada top 25 broker per sisi. Broker dominan tidak berarti pemilik manfaat atau pengendali emiten.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi pengujian</CardTitle>
          <CardDescription>Maksimal 20 ticker dan 366 hari per eksekusi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={runBacktest}>
            <div className="space-y-2">
              <Label htmlFor="backtest-symbols">Ticker</Label>
              <textarea
                id="backtest-symbols"
                value={symbolInput}
                onChange={(event) => setSymbolInput(event.target.value)}
                placeholder="CUAN, BBCA, TLKM"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{symbols.length} / 20 ticker unik</span>
                {symbols.slice(0, 20).map((symbol) => <Badge key={symbol} variant="secondary">{symbol}</Badge>)}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="backtest-start">Tanggal awal sinyal</Label>
                <Input id="backtest-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backtest-end">Tanggal akhir sinyal</Label>
                <Input id="backtest-end" type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backtest-as-of">As-of date (opsional)</Label>
                <Input id="backtest-as-of" type="date" min={endDate} value={asOfDate} onChange={(event) => setAsOfDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backtest-lookback">Lookback sesi</Label>
                <Input id="backtest-lookback" type="number" min={5} max={60} value={lookback} onChange={(event) => setLookback(event.target.valueAsNumber)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Arah sinyal</Label>
                <Select value={direction} onValueChange={(value) => setDirection(value as BrokerFlowBacktestDirection)}>
                  <SelectTrigger aria-label="Arah sinyal"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCUMULATION">Akumulasi</SelectItem>
                    <SelectItem value="DISTRIBUTION">Distribusi</SelectItem>
                    <SelectItem value="BOTH">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Forward horizon</legend>
                <div className="flex h-9 flex-wrap items-center gap-4 rounded-md border px-3">
                  {ALL_HORIZONS.map((horizon) => (
                    <label key={horizon} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={horizons.includes(horizon)} onChange={() => toggleHorizon(horizon)} />
                      {horizon}D
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-semibold">Advanced thresholds</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="min-consistency">Min consistency</Label>
                  <Input id="min-consistency" type="number" step="0.01" min={0} max={1} value={minConsistency} onChange={(event) => setMinConsistency(event.target.valueAsNumber)} />
                  <p className="text-xs text-muted-foreground">Rasio 0–1; default 0.60.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-intensity">Min intensity</Label>
                  <Input id="min-intensity" type="number" step="0.01" min={0} max={1} value={minIntensity} onChange={(event) => setMinIntensity(event.target.valueAsNumber)} />
                  <p className="text-xs text-muted-foreground">Rasio 0–1; default 0.05.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-same-sign">Min same-sign share</Label>
                  <Input id="min-same-sign" type="number" step="0.01" min={0} max={1} value={minSameSignShare} onChange={(event) => setMinSameSignShare(event.target.valueAsNumber)} />
                  <p className="text-xs text-muted-foreground">Rasio 0–1; default 0.40.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-results">Maksimum hasil</Label>
                  <Input id="max-results" type="number" min={1} max={1000} value={maxResults} onChange={(event) => setMaxResults(event.target.valueAsNumber)} />
                </div>
              </div>
              <div className="mt-5 space-y-4 border-t pt-4">
                <label className="flex items-center gap-2 text-sm font-medium" htmlFor="persist-result">
                  <input
                    id="persist-result"
                    type="checkbox"
                    checked={persistResult}
                    onChange={(event) => setPersistResult(event.target.checked)}
                  />
                  Simpan hasil ke DB
                </label>
                {persistResult && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="variant-number">Nomor variasi</Label>
                      <Input id="variant-number" type="number" min={1} max={20} value={variantNumber} onChange={(event) => setVariantNumber(event.target.valueAsNumber)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variant-name">Nama variasi</Label>
                      <Input id="variant-name" maxLength={64} value={variantName} onChange={(event) => setVariantName(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batch-id">Batch ID (opsional)</Label>
                      <Input id="batch-id" placeholder="Dibuat server pada run pertama" value={batchId} onChange={(event) => setBatchId(event.target.value.trim())} />
                    </div>
                  </div>
                )}
              </div>
            </details>

            {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
            <Button type="submit" disabled={loading}>
              <Play className="mr-2 h-4 w-4" />
              {loading ? "Menjalankan backtest..." : "Jalankan backtest"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && <ResultSkeleton />}

      {!loading && data && (
        <section className="space-y-6" aria-labelledby="backtest-results-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="backtest-results-title" className="text-xl font-semibold">Hasil backtest</h2>
              <p className="text-sm text-muted-foreground">Engine {data.version} · scope {data.data_scope}</p>
            </div>
            <Badge variant={data.truncated ? "warning" : "outline"}>{data.returned} dari {data.total_signals} sinyal</Badge>
          </div>

          {data.persisted && data.batch_id && (
            <Card className="border-emerald-500/40 bg-emerald-500/5" data-testid="backtest-persisted-result">
              <CardContent className="pt-6 text-sm">
                <p className="font-semibold text-emerald-600">Hasil tersimpan ke DB</p>
                <p className="mt-1 text-muted-foreground">
                  Batch <span className="font-mono text-foreground" data-testid="persisted-batch-id">{data.batch_id}</span>
                  {` · ${data.rows_inserted ?? 0} baris horizon tersimpan`}
                </p>
              </CardContent>
            </Card>
          )}

          {(data.truncated || data.warnings.length > 0) && (
            <Card className="border-amber-500/40">
              <CardContent className="flex gap-3 pt-6 text-sm">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">Coverage dan keterbatasan</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {data.truncated && <li>• Hasil dipotong pada batas maksimum yang dipilih.</li>}
                    {data.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total sinyal</p><p className="text-2xl font-bold tabular-nums">{data.total_signals}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Hasil dikembalikan</p><p className="text-2xl font-bold tabular-nums">{data.returned}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Ticker diuji</p><p className="text-2xl font-bold tabular-nums">{data.parameters.symbols.length}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Statistik per horizon</CardTitle><CardDescription>Semua metrik dihitung backend dengan return yang sudah disesuaikan arah sinyal.</CardDescription></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Horizon</TableHead><TableHead className="text-right">Sample</TableHead><TableHead className="text-right">Hit Rate</TableHead><TableHead className="text-right">Mean</TableHead><TableHead className="text-right">Median</TableHead><TableHead className="text-right">Mean Excess</TableHead><TableHead className="text-right">Mean MAE</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.stats.map((stat) => (
                    <TableRow key={stat.horizon_sessions}>
                      <TableCell className="font-medium">{stat.horizon_sessions}D</TableCell>
                      <TableCell className="text-right">{stat.sample_size}</TableCell>
                      <TableCell className="text-right">{stat.hit_rate === null ? "—" : `${stat.hit_rate.toFixed(1)}%`}</TableCell>
                      <TableCell className={`text-right ${metricTone(stat.mean_return_pct)}`}>{nullablePercent(stat.mean_return_pct)}</TableCell>
                      <TableCell className={`text-right ${metricTone(stat.median_return_pct)}`}>{nullablePercent(stat.median_return_pct)}</TableCell>
                      <TableCell className={`text-right ${metricTone(stat.mean_excess_return_pct)}`}>{nullablePercent(stat.mean_excess_return_pct)}</TableCell>
                      <TableCell className="text-right text-red-500">{nullablePercent(stat.mean_max_adverse_excursion_pct)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail sinyal</CardTitle>
              <CardDescription>Entry selalu pada open sesi berikutnya. “—” berarti horizon belum tersedia sebelum cutoff.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.results.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center" role="status">
                  <BarChart3 className="h-9 w-9 text-muted-foreground" />
                  <p className="font-semibold">Tidak ada sinyal yang memenuhi threshold</p>
                  <p className="text-sm text-muted-foreground">Coba rentang lebih panjang, ticker lain, atau evaluasi threshold Advanced.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Sinyal / Entry</TableHead><TableHead>Ticker</TableHead><TableHead>Broker</TableHead><TableHead>Arah</TableHead><TableHead className="text-right">Net</TableHead><TableHead className="text-right">Intensity</TableHead><TableHead className="text-right">Consistency</TableHead><TableHead className="text-right">Same Sign</TableHead><TableHead>Outcomes</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {visibleResults.map((row, index) => (
                          <TableRow key={`${row.stock_code}-${row.signal_date}-${row.broker_code}-${index}`}>
                            <TableCell className="whitespace-nowrap text-xs"><div>{row.signal_date}</div><div className="text-muted-foreground">Entry {row.entry_date} @ {formatIDR(row.entry_price)}</div></TableCell>
                            <TableCell className="font-bold">{row.stock_code}</TableCell>
                            <TableCell>{row.broker_code}<div className="text-xs text-muted-foreground">{row.covered_sessions} sesi</div></TableCell>
                            <TableCell><Badge variant={row.direction === "ACCUMULATION" ? "success" : "destructive"}>{row.direction === "ACCUMULATION" ? "Akumulasi" : "Distribusi"}</Badge></TableCell>
                            <TableCell className={`text-right ${metricTone(row.net_value)}`}>{formatIDR(row.net_value)}</TableCell>
                            <TableCell className="text-right">{ratioPercent(row.intensity)}</TableCell>
                            <TableCell className="text-right">{ratioPercent(row.consistency)}</TableCell>
                            <TableCell className="text-right">{ratioPercent(row.same_sign_share)}</TableCell>
                            <TableCell className="min-w-[220px]">
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(row.outcomes).map(([key, outcome]) => (
                                  <span key={key} className="rounded border px-2 py-1 text-xs" title={`Benchmark ${nullablePercent(outcome.benchmark_pct)} · Excess ${nullablePercent(outcome.excess_return_pct)} · MAE ${nullablePercent(outcome.max_adverse_excursion_pct)}`}>
                                    {outcome.horizon_sessions}D <span className={metricTone(outcome.return_pct)}>{nullablePercent(outcome.return_pct)}</span>
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {maxPage > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Halaman {page} dari {maxPage}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}><ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(maxPage, current + 1))} disabled={page === maxPage}>Berikutnya <ChevronRight className="ml-1 h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
