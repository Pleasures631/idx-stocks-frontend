"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, BarChart3, CalendarDays, Info, ListChecks, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatIDR } from "@/lib/utils"
import { dailyStockPicksService } from "@/services/daily-stock-picks"
import type { DailyPickComponentScores, DailyPickFormula, DailyPickWeights, DailyStockPick, DailyStockPicksData } from "@/types"
import { LockedFeature, hasFeatureAccess } from "@/components/access/locked-feature"
import { useAuthStore } from "@/stores/auth-store"

const componentMeta: Array<{ key: keyof DailyPickComponentScores; label: string; weightKey: keyof DailyPickWeights }> = [
  { key: "room", label: "Ruang naik", weightKey: "room" },
  { key: "trend", label: "Trend", weightKey: "trend" },
  { key: "base", label: "Base", weightKey: "base" },
  { key: "breakout", label: "Breakout", weightKey: "breakout" },
  { key: "liquidity", label: "Likuiditas", weightKey: "liquidity" },
  { key: "broker", label: "Broker flow", weightKey: "broker" },
]

function formatSignedPercent(value: number) { return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%` }
function formatLayer(layer: DailyStockPick["layer"]) { return layer === "FIRST_LAYER" ? "First layer" : "Second layer" }
function formatWeight(value: number | undefined) { return `${Math.round((value ?? 0) * 100)}%` }

function PickSkeleton() {
  return <Card><CardHeader className="space-y-3"><Skeleton className="h-5 w-24" /><Skeleton className="h-8 w-40" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
}
function ScoreComponents({ scores, weights }: { scores: DailyPickComponentScores; weights: DailyPickWeights }) {
  return <div className="space-y-2" aria-label="Komponen skor">
    {componentMeta.map(({ key, label, weightKey }) => {
      const score = Math.max(0, Math.min(100, scores[key] ?? 0))
      return <div key={key} className="grid grid-cols-[100px_1fr_42px] items-center gap-2 text-xs"><span className="text-muted-foreground">{label} <span className="sr-only">bobot {formatWeight(weights[weightKey])}</span></span><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} /></div><span className="text-right font-medium tabular-nums">{score.toFixed(0)}</span></div>
    })}
  </div>
}

function PickCard({ pick, formula }: { pick: DailyStockPick; formula: DailyPickFormula }) {
  const brokerVariant = pick.broker_flow_status === "confirmed_positive" ? "success" : pick.broker_flow_status === "confirmed_negative" ? "destructive" : "secondary"
  return <Card className="overflow-hidden"><article aria-labelledby={`pick-${pick.ticker}`}><CardHeader className="space-y-3 border-b bg-muted/20"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="secondary">Peringkat #{pick.rank}</Badge><Badge variant="default">Early Swing Setup</Badge><Badge variant="outline">{pick.setup_label}</Badge><Badge variant="outline">{formatLayer(pick.layer)}</Badge></div><CardTitle className="text-xl"><h3 id={`pick-${pick.ticker}`}><Link href={`/stocks/${pick.ticker}`} className="hover:underline">{pick.ticker}</Link></h3></CardTitle><CardDescription className="mt-1 truncate">{pick.stock_name}</CardDescription></div><div className="shrink-0 text-right"><div className="text-3xl font-bold tabular-nums">{pick.score.toFixed(2)}</div><div className="text-xs text-muted-foreground">skor relatif</div></div></div><p className="text-xs text-muted-foreground">Early swing setup, bukan sinyal beli atau prediksi profit.</p></CardHeader><CardContent className="space-y-5 pt-5"><dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3"><div><dt className="text-xs text-muted-foreground">RSI14</dt><dd className="font-semibold tabular-nums">{pick.rsi_14.toFixed(2)}</dd></div><div><dt className="text-xs text-muted-foreground">Return 20 sesi</dt><dd className="font-semibold tabular-nums">{formatSignedPercent(pick.momentum_20d_pct)}</dd></div><div><dt className="text-xs text-muted-foreground">Return 5 sesi</dt><dd className="font-semibold tabular-nums">{formatSignedPercent(pick.return_5d_pct)}</dd></div><div><dt className="text-xs text-muted-foreground">Jarak high20</dt><dd className="font-semibold tabular-nums">{pick.distance_to_high_20d_pct.toFixed(2)}%</dd></div><div><dt className="text-xs text-muted-foreground">ATR14 / harga</dt><dd className="font-semibold tabular-nums">{pick.atr_14_pct.toFixed(2)}%</dd></div><div><dt className="text-xs text-muted-foreground">Posisi vs SMA20</dt><dd className="font-semibold tabular-nums">{formatSignedPercent(pick.trend_vs_sma20_pct)}</dd></div><div><dt className="text-xs text-muted-foreground">Market cap</dt><dd className="font-semibold tabular-nums">{formatIDR(pick.market_cap)}</dd></div><div><dt className="text-xs text-muted-foreground">ADTV20</dt><dd className="font-semibold tabular-nums">{formatIDR(pick.adtv_20d)}</dd></div><div><dt className="text-xs text-muted-foreground">Broker flow</dt><dd className="space-y-1"><Badge variant={brokerVariant}>{pick.broker_confirmation}</Badge><span className="block text-xs text-muted-foreground">Status: {pick.broker_flow_status}</span></dd></div></dl><ScoreComponents scores={pick.component_scores} weights={formula.weights} /><div><h3 className="mb-2 text-sm font-semibold">Reasons & risk status</h3><ul className="space-y-1.5 text-xs text-muted-foreground">{pick.reasons.map((reason) => <li key={reason} className="flex gap-2"><span aria-hidden="true">•</span><span>{reason}</span></li>)}</ul><p className="mt-2 text-xs text-muted-foreground">Risk flags mengikuti filter dan status yang dihitung backend.</p></div><Button variant="outline" size="sm" asChild><Link href={`/stocks/${pick.ticker}`}>Lihat detail saham <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></CardContent></article></Card>
}

export function DailyStockPicksPage() {
  const user = useAuthStore((state) => state.user)
  const featureAccess = hasFeatureAccess(user, "dailyPicks")
  const [data, setData] = useState<DailyStockPicksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!featureAccess) { setLoading(false); return }
    let active = true
    setLoading(true); setError(null)
    dailyStockPicksService.getDailyStockPicks().then((result) => { if (active) setData(result) }).catch(() => { if (active) { setData(null); setError("Daily stock picks belum dapat dimuat. Periksa koneksi, lalu coba lagi.") } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [featureAccess, reloadKey])

  if (!featureAccess) return <LockedFeature feature="dailyPicks" />

  return <div className="mx-auto max-w-7xl space-y-6"><header className="space-y-2"><div className="flex items-center gap-2 text-sm font-medium text-primary"><ListChecks className="h-4 w-4" /> Early Swing Screener</div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Daily 5 Stock Picks</h1><p className="max-w-3xl text-sm text-muted-foreground sm:text-base">Kandidat swing 5–10 sesi dari data EOD. Fokus pada saham first/second layer yang belum overextended dan masih punya ruang bergerak.</p></header><Card className="border-amber-500/50 bg-amber-500/5" role="note" aria-label="Disclaimer investasi"><CardContent className="flex gap-3 pt-6"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div className="space-y-1 text-sm"><p className="font-semibold">Bukan nasihat investasi atau janji keuntungan.</p><p className="text-muted-foreground">Moonstock adalah label screening untuk setup early swing, bukan jaminan harga akan naik. Periksa likuiditas, berita, risiko, dan rencana keluar Anda.</p></div></CardContent></Card>{loading && <section aria-label="Memuat Daily 5 Stock Picks" aria-busy="true"><p className="mb-4 text-sm text-muted-foreground" role="status">Menghitung early-swing setup dari data EOD...</p><div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <PickSkeleton key={index} />)}</div></section>}{!loading && error && <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-10 text-center"><AlertTriangle className="h-8 w-8 text-destructive" /><p className="text-sm font-medium text-destructive">{error}</p><Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}>Coba lagi</Button></CardContent></Card>}{!loading && !error && data && <><Card><CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4"><div className="flex gap-3"><CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Tanggal sinyal/data</p><p className="font-semibold tabular-nums">{data.signal_date ?? "Belum tersedia"}</p></div></div><div className="flex gap-3"><ArrowRight className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Target swing</p><p className="font-semibold tabular-nums">{data.intended_execution_date ?? "Belum tersedia"}</p><p className="text-xs text-muted-foreground">sesi reguler berikutnya</p></div></div><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Cutoff data</p><p className="font-semibold">{data.cutoff_time}</p><p className="text-xs text-muted-foreground">{data.timezone}</p></div></div><div className="flex gap-3"><BarChart3 className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Status data</p><Badge variant={data.data_status === "ready" && !data.is_stale ? "success" : "secondary"}>{data.data_status === "latest_data_incomplete_fallback" ? "Fallback sesi sebelumnya" : data.is_stale ? "Data lama" : data.data_status === "ready" ? "Siap" : "Belum ada data"}</Badge></div></div></CardContent></Card>{(data.data_status === "latest_data_incomplete_fallback" || data.is_stale) && <Card className="border-amber-500/40" role="status"><CardContent className="flex gap-3 pt-6 text-sm"><Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><p>{data.data_status === "latest_data_incomplete_fallback" ? `Impor ${data.latest_observed_date ?? "terbaru"} belum lengkap, sehingga ranking memakai sesi lengkap sebelumnya.` : "Tanggal eksekusi fallback sudah lewat. Pastikan data pasar terbaru tersedia."}</p></CardContent></Card>}{data.picks.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center" role="status"><BarChart3 className="h-10 w-10 text-muted-foreground" /><p className="font-semibold">Belum ada kandidat early swing yang memenuhi filter</p><p className="max-w-lg text-sm text-muted-foreground">Tidak ada saham first/second layer dengan base, likuiditas, dan ruang breakout yang cukup pada sesi sinyal.</p></CardContent></Card> : <section aria-labelledby="ranked-picks-title"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 id="ranked-picks-title" className="text-xl font-semibold">Peringkat early swing</h2><p className="text-sm text-muted-foreground">{data.picks.length} kandidat pada {data.signal_date}</p></div><Badge variant="outline">Formula {data.formula.version}</Badge></div><div className="grid gap-4 lg:grid-cols-2">{data.picks.map((pick) => <PickCard key={pick.ticker} pick={pick} formula={data.formula} />)}</div></section>}<Card><CardHeader><CardTitle className="text-lg">Cara skor dihitung</CardTitle><CardDescription>{data.formula.description}</CardDescription></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex flex-wrap gap-2">{componentMeta.map(({ label, weightKey }) => <Badge key={label} variant="outline">{label} {formatWeight(data.formula.weights[weightKey])}</Badge>)}</div><details className="rounded-md border p-3"><summary className="cursor-pointer font-medium">Kriteria dan keterbatasan</summary><div className="mt-3 grid gap-4 md:grid-cols-2"><div><h3 className="mb-2 font-medium">Syarat eligible</h3><ul className="space-y-1 text-muted-foreground">{data.formula.eligibility.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="mb-2 font-medium">Keterbatasan</h3><ul className="space-y-1 text-muted-foreground">{data.limitations.map((item) => <li key={item}>• {item}</li>)}</ul></div></div></details></CardContent></Card></>}</div>
}
