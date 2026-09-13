"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Check, CircleDot, Orbit, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReplayRoadmapSnapshot, WyckoffRoadmap, WyckoffRoadmapNode } from "@/types"

function nodeClass(node: WyckoffRoadmapNode) {
  if (node.status === "current") return "border-orange-300 bg-orange-400/15 text-orange-100 shadow-[0_0_24px_rgba(251,146,60,0.55)]"
  if (node.status === "completed") return "border-emerald-300/80 bg-emerald-400/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.28)]"
  if (node.key === "distribution" || node.key === "utad" || node.key === "markdown") return "border-red-300/30 bg-red-400/5 text-red-100/70"
  return "border-slate-500/40 bg-slate-400/5 text-slate-300/70"
}

function connectorClass(node: WyckoffRoadmapNode) {
  return node.status === "completed" ? "border-emerald-300/60 text-emerald-200" : "border-slate-500/40 text-slate-500"
}

const CONSTELLATION_STARS = [
  [8, 18, 0], [16, 32, 1.2], [28, 12, 2.1], [37, 26, 0.6],
  [49, 10, 1.7], [59, 22, 2.8], [70, 14, 1.1], [82, 28, 2.4],
  [91, 12, 0.3], [12, 58, 1.9], [24, 76, 0.8], [42, 66, 2.5],
  [55, 84, 1.4], [67, 62, 0.2], [78, 78, 2.2], [94, 66, 1.6],
] as const

function RoadmapTrack({ roadmap }: { roadmap: WyckoffRoadmap }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-indigo-300/15 bg-slate-950/70">
      <ol className="relative grid min-w-[820px] grid-cols-8 gap-1 px-5 py-10">
        {roadmap.nodes.map((node, index) => (
          <li key={node.key} className="relative flex min-w-0 flex-col items-center text-center">
            {index > 0 && <span className={`absolute left-[calc(-50%+24px)] top-6 z-20 h-px w-[calc(100%-48px)] border-t ${connectorClass(node)}`}><ArrowRight className="absolute right-1 -top-2 h-4 w-4" /></span>}
            <div className="relative z-10">
              {node.status === "current" && <span className="absolute -inset-2 animate-ping rounded-full bg-orange-300/20" />}
              <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border p-0 leading-none ${nodeClass(node)}`}>
                {node.status === "completed" ? <Check className="block h-5 w-5 shrink-0" /> : node.status === "current" ? <Sparkles className="block h-5 w-5 shrink-0" /> : <CircleDot className="block h-4 w-4 shrink-0" />}
              </span>
            </div>
            <span className={`mt-3 max-w-[92px] text-[11px] font-medium leading-tight ${node.status === "current" ? "text-orange-100" : "text-slate-300"}`}>{node.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function RoadmapSummary({ roadmap }: { roadmap: WyckoffRoadmap }) {
  const currentNode = roadmap.nodes.find((node) => node.status === "current")
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <div className="rounded-xl border border-orange-300/25 bg-orange-400/5 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-orange-200/70">Fase sekarang</div>
        <div className="mt-1 text-xl font-semibold text-orange-100">{currentNode?.label ?? roadmap.phase_label}</div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentNode?.description ?? "Belum ada fase yang cukup terkonfirmasi dari history yang tersedia."}</p>
      </div>
      <div className="rounded-xl border border-indigo-300/20 bg-indigo-400/5 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-indigo-200/70">Evidence</div>
        <ul className="mt-2 space-y-2 text-sm text-slate-200">
          {roadmap.evidence.length > 0 ? roadmap.evidence.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 block h-4 w-4 shrink-0 text-emerald-300" />{item}</li>) : <li className="text-slate-400">Belum ada evidence yang cukup.</li>}
        </ul>
      </div>
    </div>
  )
}

interface WyckoffOrbitalRoadmapProps {
  roadmap?: WyckoffRoadmap | null
  replayRoadmaps?: ReplayRoadmapSnapshot[]
}

export function WyckoffOrbitalRoadmap({ roadmap, replayRoadmaps = [] }: WyckoffOrbitalRoadmapProps) {
  const [useReplay, setUseReplay] = useState(false)
  const replayAvailable = replayRoadmaps.length > 0
  const baseRoadmap = roadmap ?? replayRoadmaps[0]?.roadmap

  useEffect(() => {
    if (!replayAvailable) setUseReplay(false)
  }, [replayAvailable])

  if (!baseRoadmap) return null

  return (
    <Card className="relative mt-6 overflow-hidden border-indigo-400/30 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_20%,rgba(129,140,248,0.22),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.14),transparent_20%),radial-gradient(circle_at_60%_90%,rgba(244,114,182,0.12),transparent_24%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
        <svg className="absolute inset-0 h-full w-full text-indigo-200/20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M8 18 L28 12 L37 26 L49 10" fill="none" stroke="currentColor" strokeWidth="0.18" />
          <path d="M59 22 L70 14 L82 28" fill="none" stroke="currentColor" strokeWidth="0.18" />
          <path d="M24 76 L42 66 L55 84 L67 62 L78 78" fill="none" stroke="currentColor" strokeWidth="0.18" />
        </svg>
        {CONSTELLATION_STARS.map(([left, top, delay]) => (
          <span key={`${left}-${top}`} className="absolute animate-pulse text-[10px] leading-none text-sky-100 drop-shadow-[0_0_7px_rgba(191,219,254,0.95)]" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}>
            &#10022;
          </span>
        ))}
      </div>
      <CardHeader className="relative space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-300" /><CardTitle>Wyckoff Orbital Roadmap</CardTitle></div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">{useReplay ? "Replay" : `${baseRoadmap.observed_sessions} sesi`}</span>
            <button type="button" role="switch" aria-label="Gunakan roadmap replay" aria-checked={useReplay} disabled={!replayAvailable} onClick={() => setUseReplay((current) => !current)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useReplay ? "bg-orange-400" : "bg-slate-700"} disabled:cursor-not-allowed disabled:opacity-50`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${useReplay ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <Badge className="border-orange-300/40 bg-orange-400/15 text-orange-100">{useReplay ? "Snapshot Replay" : baseRoadmap.phase_label}</Badge>
          </div>
        </div>
        <CardDescription className="text-slate-400">{useReplay ? `Replay memakai window ${replayRoadmaps[0]?.roadmap.observed_sessions ?? 0} sesi perdagangan sampai tiap tanggal snapshot untuk broker flow dan fase Wyckoff.` : `Fase terakhir ${baseRoadmap.effective_end_date} - struktur ${baseRoadmap.observed_sessions} sesi - bukan prediksi harga`}</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-5">
        {useReplay && replayAvailable ? (
          <div className="space-y-4">
            {replayRoadmaps.map((snapshot) => (
              <div key={snapshot.date} className="space-y-4 rounded-xl border border-orange-300/20 bg-orange-400/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-orange-100">Snapshot {snapshot.date}</span>
                  <Badge className="border-orange-300/40 bg-orange-400/15 text-orange-100">{snapshot.roadmap.phase_label}</Badge>
                </div>
                <div className="text-xs text-slate-400">Window replay: {snapshot.roadmap.observed_sessions} sesi perdagangan · Struktur Wyckoff {snapshot.roadmap.observed_sessions} sesi ({snapshot.roadmap.effective_start_date} - {snapshot.roadmap.effective_end_date})</div>
                <RoadmapTrack roadmap={snapshot.roadmap} />
                <RoadmapSummary roadmap={snapshot.roadmap} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {useReplay && <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100/80">Jalankan replay terlebih dahulu untuk mengisi roadmap berdasarkan snapshot.</div>}
            <RoadmapTrack roadmap={baseRoadmap} />
            <RoadmapSummary roadmap={baseRoadmap} />
            {baseRoadmap.warnings.length > 0 && <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100/80">{baseRoadmap.warnings[0]}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
