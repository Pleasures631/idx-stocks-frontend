"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBigNumber, formatIDR } from "@/lib/utils"
import type { StockAnalyze, AnalyzeBrokerFlow } from "@/types"

interface BrokerFlowAnalysisProps {
  analyze: StockAnalyze
}

function flowTone(value: number) {
  if (value > 0) return "text-emerald-500"
  if (value < 0) return "text-red-500"
  return ""
}

function StatItem({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${tone ?? ""}`}>{value}</div>
    </div>
  )
}

function FlowTable({ title, rows, side }: { title: string; rows: AnalyzeBrokerFlow[]; side: "buy" | "sell" }) {
  const priceLabel = side === "buy" ? "Avg Buy" : "Avg Sell"

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Broker</TableHead>
            <TableHead className="text-right">Net</TableHead>
            <TableHead className="text-right">{priceLabel}</TableHead>
            <TableHead className="text-right">Active Days</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.broker_code}>
              <TableCell>
                <div className="font-medium">{row.broker_code}</div>
                <div className="text-xs text-muted-foreground">{row.broker_type}</div>
              </TableCell>
              <TableCell className={`text-right font-medium ${flowTone(row.net_value)}`}>{row.formatted_net_value}</TableCell>
              <TableCell className="text-right">
                {(side === "buy" ? row.buy_avg_price : row.sell_avg_price) > 0
                  ? formatIDR(side === "buy" ? row.buy_avg_price : row.sell_avg_price)
                  : "—"}
              </TableCell>
              <TableCell className="text-right">{row.active_days}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function BrokerFlowAnalysis({ analyze }: BrokerFlowAnalysisProps) {
  const accumulation = analyze.brokers_accumulation ?? []
  const distribution = analyze.brokers_distribution ?? []
  const anomalies = analyze.anomalies ?? []
  const signals = [
    { label: "Foreign Leadership", on: analyze.foreign_leadership, description: "Broker/group Foreign menjadi pemimpin net flow pada periode analisis." },
    { label: "Price Confirms", on: analyze.price_confirms, description: "Arah net flow smart money sejalan dengan perubahan harga saham." },
    { label: "Volume Spike", on: analyze.has_volume_spike, description: "Rata-rata volume perdagangan periode analisis meningkat signifikan dibanding baseline." },
    { label: "Momentum Accelerating", on: analyze.momentum_accelerating, description: "Net buying smart money lebih besar pada paruh kedua periode analisis." },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Analisis Broker Flow</CardTitle>
          <Badge variant="warning">{analyze.phase}</Badge>
        </div>
        <CardDescription>
          {analyze.start_date} – {analyze.end_date} · {analyze.total_days} hari · {analyze.display_status}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatItem label="Net Flow" value={analyze.formatted_net_value} tone={flowTone(analyze.net_value)} />
          <StatItem label="Total Buy" value={analyze.formatted_buy_value} />
          <StatItem label="Total Sell" value={analyze.formatted_sell_value} />
          <StatItem label="Foreign Net" value={analyze.formatted_foreign_net} tone={flowTone(analyze.foreign_net_value)} />
          <StatItem label="Retail Net" value={formatBigNumber(analyze.retail_net)} tone={flowTone(analyze.retail_net)} />
          <StatItem label="Institutional Net" value={formatBigNumber(analyze.institutional_net)} tone={flowTone(analyze.institutional_net)} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            title="Perbandingan kontribusi net flow Foreign dan Institutional terhadap total net flow. Nilai lebih tinggi berarti smart money lebih dominan."
          >
            Smart Money Ratio: {analyze.smart_money_ratio.toFixed(2)}
          </Badge>
          <Badge
            variant="outline"
            title="Jumlah hari ketika gabungan Foreign dan Institutional mencatat net buy dalam periode analisis."
          >
            Smart Money Active: {analyze.smart_money_active_days} / {analyze.total_days} hari
          </Badge>
          <Badge
            variant="outline"
            title="Persentase hari aktif smart money dibandingkan total hari aktif pada periode analisis."
          >
            Konsistensi: {analyze.smart_money_consistency.toFixed(0)}%
          </Badge>
          <Badge
            variant="outline"
            title="HHI Buy mengukur seberapa terkonsentrasi nilai beli pada broker tertentu. Skala 0-10.000; makin tinggi berarti makin terkonsentrasi."
          >
            HHI Buy: {(analyze.buy_hhi ?? 0).toFixed(0)}
          </Badge>
          <Badge
            variant="outline"
            title="HHI Sell mengukur seberapa terkonsentrasi nilai jual pada broker tertentu. Skala 0-10.000; makin tinggi berarti makin terkonsentrasi."
          >
            HHI Sell: {(analyze.sell_hhi ?? 0).toFixed(0)}
          </Badge>
          <Badge
            variant="outline"
            title="HHI Total mengukur konsentrasi gabungan nilai beli dan jual seluruh broker. Skala 0-10.000; makin tinggi berarti makin terkonsentrasi."
          >
            HHI Total: {(analyze.total_hhi ?? 0).toFixed(0)}
          </Badge>
          {signals.map((s) => (
            <Badge
              key={s.label}
              variant={s.on ? "success" : "destructive"}
              title={s.description}
            >
              {s.label}
            </Badge>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FlowTable title="Brokers Akumulasi" rows={accumulation} side="buy" />
          <FlowTable title="Brokers Distribusi" rows={distribution} side="sell" />
        </div>

        {anomalies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Anomali</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead className="text-right">Z-Score</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyze.anomalies.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>{a.trade_date}</TableCell>
                    <TableCell>
                      <div className="font-medium">{a.broker_code}</div>
                      <div className="text-xs text-muted-foreground">{a.broker_type}</div>
                    </TableCell>
                    <TableCell className="text-right">{a.z_score}</TableCell>
                    <TableCell className={`text-right font-medium ${flowTone(a.net_value)}`}>{a.formatted_net}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}