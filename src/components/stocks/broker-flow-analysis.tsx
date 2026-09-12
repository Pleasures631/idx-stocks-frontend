"use client"

import { AlertTriangle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBigNumber, formatIDR } from "@/lib/utils"
import { brokerCodeClassName, brokerGroupBadgeClassName } from "@/lib/broker-display"
import type { AnalyzeBrokerFlow, BrokerBehaviorProfile, DominantBrokerFlow, StockAnalyze } from "@/types"

interface BrokerFlowAnalysisProps { analyze: StockAnalyze }

function flowTone(value: number) {
  if (value > 0) return "text-emerald-500"
  if (value < 0) return "text-red-500"
  return ""
}

function ratioPercent(value: number | null | undefined, digits = 1) {
  return value == null ? "—" : `${(value * 100).toFixed(digits)}%`
}

function signedPercent(value: number | null | undefined) {
  return value == null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

function stateLabel(state: DominantBrokerFlow["state"]) {
  const labels: Record<DominantBrokerFlow["state"], string> = {
    ACCUMULATING: "Akumulasi",
    DISTRIBUTING: "Distribusi",
    ACCUMULATION_WEAKENING: "Akumulasi Melemah",
    DISTRIBUTION_WEAKENING: "Distribusi Melemah",
    MARKUP_EXTENDED: "Markup / Extended",
  }
  return labels[state]
}

function momentumLabel(momentum: DominantBrokerFlow["momentum"]) {
  const labels: Record<DominantBrokerFlow["momentum"], string> = {
    ACCELERATING: "Menguat",
    WEAKENING: "Melemah",
    REVERSING: "Berbalik",
    INSUFFICIENT_DATA: "Data belum cukup",
  }
  return labels[momentum]
}

function behaviorBadgeClassName(label: BrokerBehaviorProfile["behavior_label"]) {
  if (label === "Akumulator") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
  if (label === "Distributor") return "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300"
  if (label === "Trader aktif") return "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300"
  return "bg-muted text-muted-foreground border-border"
}

function StatItem({ label, value, tone, detail }: { label: string; value: string; tone?: string; detail?: string }) {
  return <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`text-lg font-bold ${tone ?? ""}`}>{value}</div>{detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}</div>
}

function FlowTable({ title, rows, side }: { title: string; rows: AnalyzeBrokerFlow[]; side: "buy" | "sell" }) {
  const isBuy = side === "buy"
  const priceLabel = isBuy ? "Avg Buy" : "Avg Sell"
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broker</TableHead>
              <TableHead className="text-right">Net</TableHead>
              {isBuy && <TableHead className="text-right">B LOT</TableHead>}
              {isBuy && <TableHead className="text-right">B FREQ</TableHead>}
              <TableHead className="text-right">{isBuy ? "B AVG" : priceLabel}</TableHead>
              {isBuy && <TableHead className="text-right">B VAL</TableHead>}
              <TableHead className="text-right">Active Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? <TableRow><TableCell colSpan={isBuy ? 7 : 4} className="py-6 text-center text-sm text-muted-foreground">Tidak ada data</TableCell></TableRow> : rows.slice(0, 3).map((row) => (
              <TableRow key={row.broker_code}>
                <TableCell><div className={`font-medium ${brokerCodeClassName(row.broker_group, row.broker_type)}`}>{row.broker_code}</div><div className="text-xs text-muted-foreground">{row.broker_group || row.broker_type}</div></TableCell>
                <TableCell className={`text-right font-medium ${flowTone(row.net_value)}`}>{row.formatted_net_value}</TableCell>
                {isBuy && <TableCell className="text-right">{formatBigNumber(row.buy_lot)}</TableCell>}
                {isBuy && <TableCell className="text-right">{row.buy_frequency == null ? "—" : row.buy_frequency.toLocaleString("id-ID")}</TableCell>}
                <TableCell className="text-right">{(isBuy ? row.buy_avg_price : row.sell_avg_price) > 0 ? formatIDR(isBuy ? row.buy_avg_price : row.sell_avg_price) : "—"}</TableCell>
                {isBuy && <TableCell className="text-right">Rp{formatBigNumber(row.buy_value)}</TableCell>}
                <TableCell className="text-right">{row.active_days}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function BrokerFlowAnalysis({ analyze }: BrokerFlowAnalysisProps) {
  const accumulation = analyze.brokers_accumulation ?? []
  const distribution = analyze.brokers_distribution ?? []
  const anomalies = analyze.anomalies ?? []
  const dominant = analyze.dominant_flow ?? null
  const coverage = analyze.coverage
  const warnings = analyze.warnings ?? []
  const behaviorProfiles = analyze.broker_behavior_profiles ?? []
  const dominantIsAccumulation = dominant?.direction === "ACCUMULATION"

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2"><CardTitle>Analisis Broker Flow</CardTitle>{dominant && <Badge variant={dominant.direction === "ACCUMULATION" ? "success" : "destructive"}>{stateLabel(dominant.state)}</Badge>}</div>
        <CardDescription>{coverage?.effective_start_date ?? analyze.start_date} – {coverage?.effective_end_date ?? analyze.end_date}{coverage ? ` · ${coverage.covered_sessions}/${coverage.eligible_sessions} sesi tercakup` : ` · ${analyze.total_days} hari`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {dominant ? (
          <section className="space-y-4" aria-labelledby="dominant-flow-title">
            <div className={`rounded-lg border p-4 ${dominantIsAccumulation ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${dominantIsAccumulation ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{dominantIsAccumulation ? "Dominant accumulator" : "Dominant distributor"}</p>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
                <div><div className="flex flex-wrap items-center gap-2"><h3 id="dominant-flow-title" className={`text-2xl font-bold ${brokerCodeClassName(dominant.broker_group)}`}>{dominant.broker_code}</h3><Badge variant="outline" className={brokerGroupBadgeClassName(dominant.broker_group)}>{dominant.broker_group || "UNKNOWN"}</Badge></div><p className="text-sm text-muted-foreground">{dominant.broker_name || "Nama broker tidak tersedia"}</p></div>
                <div className={`text-right ${flowTone(dominant.net_value)}`}><p className="text-xl font-bold">{dominant.formatted_net_value}</p><p className="text-xs">{dominant.direction === "ACCUMULATION" ? "Net buy" : "Net sell"}</p></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <StatItem label="Intensity vs Traded Value" value={ratioPercent(dominant.intensity)} detail="Net broker dibanding nilai transaksi IDX periode efektif" />
              <StatItem label="Konsistensi" value={ratioPercent(dominant.consistency)} detail={`${dominant.net_direction_days}/${dominant.covered_sessions} sesi searah`} />
              <StatItem label="Same-sign Share" value={ratioPercent(dominant.same_sign_share)} detail="Porsi net broker lain yang bergerak searah" />
              <StatItem label="Momentum 5 Sesi" value={momentumLabel(dominant.momentum)} tone={dominant.momentum === "ACCELERATING" ? "text-emerald-500" : dominant.momentum === "REVERSING" ? "text-red-500" : ""} detail={`Recent ${dominant.recent_5_net == null ? "—" : formatBigNumber(dominant.recent_5_net)} · Prior ${dominant.prior_5_net == null ? "—" : formatBigNumber(dominant.prior_5_net)}`} />
              <StatItem label="Weighted Average Price" value={dominant.weighted_average_price == null ? "—" : formatIDR(dominant.weighted_average_price)} detail={dominant.latest_close == null ? "Latest close tidak tersedia" : `Latest close ${formatIDR(dominant.latest_close)}`} />
              <StatItem label="Posisi Harga" value={signedPercent(dominant.price_position_pct)} tone={dominant.price_position_pct == null ? "" : flowTone(dominant.price_position_pct)} detail={dominant.price_confirmation === "CONFIRMED" ? "Harga mengonfirmasi flow" : dominant.price_confirmation === "NOT_CONFIRMED" ? "Harga belum mengonfirmasi flow" : "Konfirmasi belum tersedia"} />
            </div>
          </section>
        ) : (
          <div className="flex gap-3 rounded-lg border p-4 text-sm" role="status"><Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /><p>Belum ada dominant broker yang memenuhi data minimum pada periode ini.</p></div>
        )}

        {behaviorProfiles.length > 0 && (
          <section className="space-y-3" aria-labelledby="broker-behavior-title">
            <div>
              <h3 id="broker-behavior-title" className="text-base font-semibold">Perilaku Broker 20 Sesi</h3>
              <p className="text-xs text-muted-foreground">Profil dan bukti transaksi broker dari snapshot 20 sesi terakhir yang tersedia.</p>
              <p className="text-xs text-muted-foreground">“Ritel kecil” dan “Pemain besar” adalah indikasi dari ukuran ticket, bukan kepastian identitas nasabah.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {behaviorProfiles.map((profile) => (
                <div key={profile.broker_code} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className={"font-semibold " + brokerCodeClassName(profile.broker_group, profile.broker_type)}>{profile.broker_code}</div>
                      <div className="text-xs text-muted-foreground">{profile.broker_name || "Nama broker tidak tersedia"}</div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge variant="outline" className={brokerGroupBadgeClassName(profile.broker_group)}>{profile.broker_group || "UNKNOWN"}</Badge>
                      <Badge variant="outline" className={behaviorBadgeClassName(profile.behavior_label)}>{profile.behavior_label}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                    <div><div className="text-muted-foreground">Aktif</div><div className="font-semibold">{profile.active_sessions}/{profile.effective_sessions}</div></div>
                    <div><div className="text-muted-foreground">Net buy</div><div className="font-semibold">{profile.net_buy_sessions} sesi</div></div>
                    <div><div className="text-muted-foreground">B FREQ</div><div className="font-semibold">{profile.buy_frequency.toLocaleString("id-ID")}</div></div>
                    <div><div className="text-muted-foreground">B AVG</div><div className="font-semibold">{profile.buy_avg_price > 0 ? formatIDR(profile.buy_avg_price) : "—"}</div></div>
                    <div><div className="text-muted-foreground">S FREQ</div><div className="font-semibold">{profile.sell_frequency.toLocaleString("id-ID")}</div></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>B LOT {formatBigNumber(profile.buy_lot)}</span>
                    <span>B VAL Rp{formatBigNumber(profile.buy_value)}</span>
                    <span>S LOT {formatBigNumber(profile.sell_lot)}</span>
                    <span>S VAL Rp{formatBigNumber(profile.sell_value)}</span>
                    <span>Net {profile.net_value >= 0 ? "+" : "−"}Rp{formatBigNumber(Math.abs(profile.net_value))}</span>
                    <span>S AVG {profile.sell_avg_price > 0 ? formatIDR(profile.sell_avg_price) : "—"}</span>
                    <span>{profile.ticket_label}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(coverage || warnings.length > 0) && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="font-semibold">Coverage data</p>{coverage && <p className="mt-1 text-muted-foreground">{ratioPercent(coverage.coverage_ratio)} sesi tercakup · {coverage.data_scope.replaceAll("_", " ")} · limit {coverage.per_side_limit} broker per sisi.</p>}{warnings.length > 0 && <ul className="mt-2 space-y-1 text-muted-foreground">{warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul>}</div></div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2"><FlowTable title="Top Broker Akumulasi" rows={accumulation} side="buy" /><FlowTable title="Top Broker Distribusi" rows={distribution} side="sell" /></div>

        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-semibold">Advanced / indikator legacy</summary>
          <div className="mt-5 space-y-5">
            <p className="text-xs text-muted-foreground">Metrik berikut dipertahankan untuk inspeksi data, bukan kesimpulan utama.</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <StatItem label="Legacy Phase" value={analyze.phase} /><StatItem label="Net Flow" value={analyze.formatted_net_value} tone={flowTone(analyze.net_value)} /><StatItem label="Total Buy" value={analyze.formatted_buy_value} /><StatItem label="Total Sell" value={analyze.formatted_sell_value} /><StatItem label="Foreign Net" value={analyze.formatted_foreign_net} tone={flowTone(analyze.foreign_net_value)} /><StatItem label="Institutional Net" value={formatBigNumber(analyze.institutional_net)} tone={flowTone(analyze.institutional_net)} />
            </div>
            <div className="flex flex-wrap gap-2"><Badge variant="outline">Smart Money Ratio: {analyze.smart_money_ratio.toFixed(2)}</Badge><Badge variant="outline">Legacy Consistency: {analyze.smart_money_consistency.toFixed(0)}%</Badge><Badge variant="outline">HHI Buy: {(analyze.buy_hhi ?? 0).toFixed(0)}</Badge><Badge variant="outline">HHI Sell: {(analyze.sell_hhi ?? 0).toFixed(0)}</Badge><Badge variant="outline">HHI Total: {(analyze.total_hhi ?? 0).toFixed(0)}</Badge></div>
            {anomalies.length > 0 && (
              <div className="overflow-x-auto"><h4 className="mb-2 text-sm font-semibold">Anomali</h4><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Broker</TableHead><TableHead className="text-right">Z-Score</TableHead><TableHead className="text-right">Net</TableHead></TableRow></TableHeader><TableBody>{anomalies.map((anomaly, index) => <TableRow key={`${anomaly.trade_date}-${anomaly.broker_code}-${index}`}><TableCell>{anomaly.trade_date}</TableCell><TableCell><span className={brokerCodeClassName(anomaly.broker_group, anomaly.broker_type)}>{anomaly.broker_code}</span><div className="text-xs text-muted-foreground">{anomaly.broker_group || anomaly.broker_type}</div></TableCell><TableCell className="text-right">{anomaly.z_score}</TableCell><TableCell className={`text-right font-medium ${flowTone(anomaly.net_value)}`}>{anomaly.formatted_net}</TableCell></TableRow>)}</TableBody></Table></div>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
