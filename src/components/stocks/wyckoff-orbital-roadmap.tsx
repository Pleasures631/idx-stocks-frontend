"use client"

import { ArrowRight, Check, CircleDot, Orbit, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WyckoffRoadmap, WyckoffRoadmapNode } from "@/types"

function nodeClass(node: WyckoffRoadmapNode) {
  if (node.status === "current") return "border-orange-300 bg-orange-400/15 text-orange-100 shadow-[0_0_24px_rgba(251,146,60,0.55)]"
  if (node.status === "completed") return "border-emerald-300/80 bg-emerald-400/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.28)]"
  if (node.key === "distribution" || node.key === "utad" || node.key === "markdown") return "border-red-300/30 bg-red-400/5 text-red-100/70"
  return "border-slate-500/40 bg-slate-400/5 text-slate-300/70"
}

function connectorClass(node: WyckoffRoadmapNode) {
  return node.status === "completed" ? "border-emerald-300/60 text-emerald-200" : "border-slate-500/40 text-slate-500"
}

export function WyckoffOrbitalRoadmap({ roadmap }: { roadmap?: WyckoffRoadmap | null }) {
  if (!roadmap) return null

  const currentNode = roadmap.nodes.find((node) => node.status === "current")
  const currentLabel = currentNode?.label ?? roadmap.phase_label

  return (
    <Card className="relative mt-6 overflow-hidden border-indigo-400/30 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_20%,rgba(129,140,248,0.22),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.14),transparent_20%),radial-gradient(circle_at_60%_90%,rgba(244,114,182,0.12),transparent_24%)]" />
      <CardHeader className="relative space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-300" /><CardTitle>Wyckoff Orbital Roadmap</CardTitle></div>
          <Badge className="border-orange-300/40 bg-orange-400/15 text-orange-100">{roadmap.phase_label}</Badge>
        </div>
        <CardDescription className="text-slate-400">Fase terakhir {roadmap.effective_end_date} - struktur {roadmap.observed_sessions} sesi - bukan prediksi harga</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <div className="overflow-x-auto rounded-xl border border-indigo-300/15 bg-slate-950/70">
          <ol className="relative grid min-w-[820px] grid-cols-8 gap-1 px-5 py-10">
            {roadmap.nodes.map((node, index) => (
              <li key={node.key} className="relative flex min-w-0 flex-col items-center text-center">
                {index > 0 && <span className={`absolute left-[-52%] right-[48%] top-6 border-t ${connectorClass(node)}`}><ArrowRight className="absolute -right-2 -top-2 h-4 w-4" /></span>}
                <div className="relative z-10">
                  {node.status === "current" && <span className="absolute -inset-2 animate-ping rounded-full bg-orange-300/20" />}
                  <span className={`relative flex h-12 w-12 items-center justify-center rounded-full border ${nodeClass(node)}`}>
                    {node.status === "completed" ? <Check className="h-5 w-5" /> : node.status === "current" ? <Sparkles className="h-5 w-5" /> : <CircleDot className="h-4 w-4" />}
                  </span>
                </div>
                <span className={`mt-3 max-w-[92px] text-[11px] font-medium leading-tight ${node.status === "current" ? "text-orange-100" : "text-slate-300"}`}>{node.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-orange-300/25 bg-orange-400/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-orange-200/70">Fase sekarang</div>
            <div className="mt-1 text-xl font-semibold text-orange-100">{currentLabel}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentNode?.description ?? "Belum ada fase yang cukup terkonfirmasi dari history yang tersedia."}</p>
          </div>
          <div className="rounded-xl border border-indigo-300/20 bg-indigo-400/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-indigo-200/70">Evidence</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {roadmap.evidence.length > 0 ? roadmap.evidence.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{item}</li>) : <li className="text-slate-400">Belum ada evidence yang cukup.</li>}
            </ul>
          </div>
        </div>

        {roadmap.warnings.length > 0 && <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100/80">{roadmap.warnings[0]}</div>}
      </CardContent>
    </Card>
  )
}
