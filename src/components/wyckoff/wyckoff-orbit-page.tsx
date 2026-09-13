"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, AlertTriangle, ArrowUpRight, Circle, Orbit, Radar, RefreshCw, Sparkles, Target, Waves } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatIDR } from "@/lib/utils"
import { LockedFeature, hasFeatureAccess } from "@/components/access/locked-feature"
import { useAuthStore } from "@/stores/auth-store"
import { wyckoffService, type WyckoffDataMode, type WyckoffOrbitData, type WyckoffPhase, type WyckoffPlanet } from "@/services/wyckoff"

const phaseStyles: Record<WyckoffPhase, { accent: string; glow: string; badge: string; dot: string }> = {
  accumulation: { accent: "text-cyan-200", glow: "shadow-cyan-500/20", badge: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100", dot: "bg-cyan-300" },
  markup: { accent: "text-emerald-200", glow: "shadow-emerald-500/20", badge: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100", dot: "bg-emerald-300" },
  distribution: { accent: "text-amber-200", glow: "shadow-amber-500/20", badge: "border-amber-300/30 bg-amber-300/10 text-amber-100", dot: "bg-amber-300" },
  markdown: { accent: "text-rose-200", glow: "shadow-rose-500/20", badge: "border-rose-300/30 bg-rose-300/10 text-rose-100", dot: "bg-rose-300" },
}

const phaseAnchors: Record<WyckoffPhase, string> = {
  accumulation: "left-4 top-5 sm:left-10 sm:top-10",
  markup: "right-4 top-5 text-right sm:right-10 sm:top-10",
  distribution: "right-4 bottom-5 text-right sm:right-10 sm:bottom-10",
  markdown: "left-4 bottom-5 sm:left-10 sm:bottom-10",
}

function confidenceLabel(value: number) {
  if (value >= 80) return "Tinggi"
  if (value >= 65) return "Menengah"
  return "Awal"
}

function Planet({ planet, selected, onSelect }: { planet: WyckoffPlanet; selected: boolean; onSelect: () => void }) {
  const style = phaseStyles[planet.phase]
  const size = Math.round(34 + planet.strength * 0.38)
  return (
    <button
      type="button"
      aria-label={`${planet.ticker}, ${planet.phase}, score ${planet.score}`}
      onClick={onSelect}
      className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 hover:z-20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${style.glow} ${selected ? "border-white bg-white/20 shadow-[0_0_30px_rgba(255,255,255,0.5)]" : "border-white/30 bg-slate-900/80 shadow-lg"}`}
      style={{ left: `${planet.orbit_position.x}%`, top: `${planet.orbit_position.y}%`, width: size, height: size }}
    >
      <span className={`absolute inset-[22%] rounded-full ${style.dot} opacity-80 blur-[1px]`} />
      <span className="relative flex h-full w-full items-center justify-center text-[10px] font-bold text-white drop-shadow sm:text-xs">{planet.ticker}</span>
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-950/95 px-2 py-1 text-[10px] text-slate-200 shadow-xl group-hover:block">{planet.name}</span>
    </button>
  )
}

function PlanetDetail({ planet, preview }: { planet: WyckoffPlanet | null; preview: boolean }) {
  if (!planet) {
    return <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm text-slate-400"><Orbit className="mb-3 h-8 w-8 text-cyan-200/70" /><p>Pilih planet untuk membaca detail sinyal.</p></div>
  }
  const style = phaseStyles[planet.phase]
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-cyan-950/20">
      <div className="flex items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><span className="text-2xl font-bold tracking-tight text-white">{planet.ticker}</span><Badge className={style.badge}>{preview ? "Preview signal" : planet.signal}</Badge></div><p className="mt-1 text-sm text-slate-400">{planet.name}</p></div>
        <ArrowUpRight className={`h-5 w-5 ${style.accent}`} />
      </div>
      {preview && <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">Data ilustrasi saja — bukan data live dan bukan rekomendasi trading.</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Harga snapshot</p><p className="mt-1 text-lg font-semibold text-white">{formatIDR(planet.price)}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Phase score</p><p className="mt-1 text-lg font-semibold text-white">{planet.score}<span className="text-xs text-slate-500">/100</span></p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Confidence</p><p className={`mt-1 text-lg font-semibold ${style.accent}`}>{confidenceLabel(planet.confidence)} <span className="text-xs text-slate-500">{planet.confidence}%</span></p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Strength</p><p className="mt-1 text-lg font-semibold text-white">{planet.strength}<span className="text-xs text-slate-500">/100</span></p></div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Mengapa di sini</p><p className="mt-2 text-sm leading-6 text-slate-300">{planet.reason}</p><Badge className={`mt-3 ${style.badge}`}>{planet.phase}</Badge></div>
    </div>
  )
}

export function WyckoffOrbitPage() {
  const user = useAuthStore((state) => state.user)
  // The local fixture is available only as visibly labelled preview data.
  // Set NEXT_PUBLIC_WYCKOFF_DATA_MODE=production to fail closed until the
  // production endpoint contract is implemented; it never falls back.
  const dataMode: WyckoffDataMode = process.env.NEXT_PUBLIC_WYCKOFF_DATA_MODE === "production" ? "production" : "preview"
  const [data, setData] = useState<WyckoffOrbitData | null>(null)
  const [selected, setSelected] = useState<WyckoffPlanet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!hasFeatureAccess(user, "wyckoff")) { setLoading(false); return }
    let active = true
    setLoading(true)
    setError(null)
    wyckoffService.getOrbit(dataMode).then((result) => {
      if (active) {
        setData(result)
        setSelected(result.phases[0]?.planets[0] ?? null)
      }
    }).catch((cause: unknown) => {
      if (!active) return
      setData(null)
      setSelected(null)
      setError(cause instanceof Error ? cause.message : "Wyckoff data belum dapat dimuat. Periksa koneksi, lalu coba lagi.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [dataMode, reloadKey, user])

  const planets = useMemo(() => data?.phases.flatMap((phase) => phase.planets) ?? [], [data])
  const preview = data?.source === "mock"

  if (!hasFeatureAccess(user, "wyckoff")) return <LockedFeature feature="wyckoff" />

  if (loading) return <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Memuat Wyckoff"><p className="text-sm text-muted-foreground" role="status">Memuat data Wyckoff...</p><Skeleton className="h-10 w-64" /><Skeleton className="aspect-square max-w-[760px] rounded-3xl" /></div>
  if (error) return <div className="mx-auto flex min-h-[360px] max-w-2xl flex-col items-center justify-center gap-4 text-center" role="alert"><AlertTriangle className="h-10 w-10 text-destructive" /><div><h1 className="text-lg font-semibold">Wyckoff data tidak tersedia</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div><Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}><RefreshCw className="mr-2 h-4 w-4" />Coba lagi</Button></div>
  if (!data || planets.length === 0) return <div className="mx-auto flex min-h-[360px] max-w-2xl flex-col items-center justify-center gap-3 text-center" role="status"><Orbit className="h-10 w-10 text-muted-foreground" /><h1 className="text-lg font-semibold">Belum ada data Wyckoff</h1><p className="text-sm text-muted-foreground">Belum ada fase atau saham yang dapat ditampilkan untuk sumber data ini.</p><Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}><RefreshCw className="mr-2 h-4 w-4" />Muat ulang</Button></div>

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 pb-8 text-slate-100">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-200"><Orbit className="h-4 w-4" /> Wyckoff intelligence layer</div><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Market Cycle Orbit</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Peta fase saham berbasis struktur harga dan flow. Klik planet untuk membaca sinyal singkatnya.</p></div>
        <div className="flex flex-col items-start gap-2 sm:items-end"><div className="flex flex-wrap items-center justify-end gap-2"><Badge className={preview ? "border-amber-300/40 bg-amber-300/15 text-amber-100" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"}>{preview ? "PREVIEW — NOT LIVE" : "LIVE / API"}</Badge><Badge variant="outline">{data.freshness.market_status === "unknown" ? "Status unknown" : data.freshness.market_status}</Badge></div><div className="text-right text-xs text-slate-500"><p>Observed {data.freshness.observed_date ?? data.as_of} · Updated {data.freshness.updated_at ?? "unknown"}</p><p>Source: {data.freshness.source}</p></div></div>
      </header>
      {data.freshness.is_stale && <div className="flex items-start gap-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100" role="status"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Data mungkin sudah stale</p><p className="mt-1 text-xs leading-5 text-amber-100/80">Snapshot terakhir {data.freshness.observed_date ?? "tidak diketahui"}. Jangan gunakan sebagai kondisi pasar saat ini.</p></div></div>}
      {preview && <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100" role="note"><p className="font-semibold">Mode preview aktif</p><p className="mt-1 text-xs leading-5 text-amber-100/80">Semua planet, harga, skor, dan sinyal di halaman ini berasal dari fixture frontend. Ini bukan data live atau rekomendasi.</p></div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <Card className="overflow-hidden border-cyan-200/10 bg-[#050b1d] shadow-2xl shadow-cyan-950/20">
          <CardHeader className="relative z-10 border-b border-white/10 bg-gradient-to-r from-cyan-400/[0.08] via-transparent to-fuchsia-400/[0.08] pb-4"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-lg text-white">Orbital phase map</CardTitle><CardDescription className="text-slate-400">Ukuran planet = strength · glow = confidence · animasi hanya sebagai orientasi.</CardDescription></div><Radar className="h-5 w-5 text-cyan-200" /></div></CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="relative mx-auto aspect-square w-full max-w-[780px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_28%),#030817]">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(186,230,253,0.75)_0.7px,transparent_0.8px)] [background-size:48px_48px]" />
              <div className="pointer-events-none absolute inset-[11%] rounded-full border border-cyan-200/10" />
              <div className="pointer-events-none absolute inset-[22%] rounded-full border border-dashed border-cyan-200/15 animate-[spin_55s_linear_infinite]" />
              <div className="pointer-events-none absolute inset-[34%] rounded-full border border-white/10" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/30 bg-cyan-200/10 shadow-[0_0_80px_rgba(34,211,238,0.25)] animate-pulse" />
              <div className="absolute left-1/2 top-1/2 z-20 flex h-[17%] w-[17%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/20 bg-slate-950/85 text-center shadow-[0_0_35px_rgba(14,165,233,0.2)]"><Circle className="mb-1 h-4 w-4 text-cyan-200" /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white sm:text-xs">Market Cycle</span><span className="mt-1 hidden text-[9px] text-slate-500 sm:block">4 phases · {planets.length} planets</span></div>
              {data.phases.map((phase) => {
                const style = phaseStyles[phase.key]
                return <div key={phase.key}><div className={`absolute z-20 ${phaseAnchors[phase.key]}`}><div className={`flex items-center gap-2 ${phase.key === "markup" || phase.key === "distribution" ? "justify-end" : ""}`}><span className={`h-2 w-2 rounded-full ${style.dot} shadow-[0_0_12px_currentColor]`} /><span className={`text-xs font-semibold ${style.accent}`}>{phase.label}</span></div><p className="mt-1 text-[10px] text-slate-500">{phase.subtitle}</p></div>{phase.planets.map((planet) => <Planet key={planet.ticker} planet={planet} selected={selected?.ticker === planet.ticker} onSelect={() => setSelected(planet)} />)}</div>
              })}
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[9px] text-slate-500">click a planet to inspect signal</div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4"><PlanetDetail planet={selected} preview={preview} /><Card className="border-white/10 bg-slate-950/40"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base text-white"><Sparkles className="h-4 w-4 text-cyan-200" /> Cara membaca orbit</CardTitle></CardHeader><CardContent className="space-y-3 text-xs leading-5 text-slate-400"><p><span className="font-semibold text-cyan-100">Accumulation</span> dan <span className="font-semibold text-emerald-100">Markup</span> menunjukkan demand yang mulai atau sedang memimpin.</p><p><span className="font-semibold text-amber-100">Distribution</span> dan <span className="font-semibold text-rose-100">Markdown</span> menunjukkan supply dan struktur yang melemah.</p><div className="flex items-center gap-2 border-t border-white/10 pt-3"><Activity className="h-4 w-4 text-slate-500" /> Score dan confidence adalah ranking indikatif, bukan prediksi profit.</div></CardContent></Card></aside>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.phases.map((phase) => { const style = phaseStyles[phase.key]; return <Card key={phase.key} className="border-white/10 bg-slate-950/30"><CardContent className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} /><span className={`text-sm font-semibold ${style.accent}`}>{phase.label}</span></div><Badge className={style.badge}>{phase.planets.length}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-500">{phase.description}</p><div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500"><Target className="h-3 w-3" /> {phase.planets.filter((planet) => planet.confidence >= 75).length} confidence tinggi</div></CardContent></Card> })}</div>
    </div>
  )
}
