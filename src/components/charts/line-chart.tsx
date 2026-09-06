"use client"

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type * as React from "react"

const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--popover-foreground))",
}

interface LineChartProps {
  data: Record<string, unknown>[]
  xKey?: string
  yKey?: string
  height?: number
  color?: string
  gradient?: boolean
  customTooltip?: (props: { active?: boolean; payload?: any[]; label?: string }) => React.ReactNode
  series?: { dataKey: string; color: string; name: string }[]
  secondarySeries?: { dataKey: string; color: string; name: string }[]
}

export function StockLineChart({
  data,
  xKey = "date",
  yKey = "value",
  height = 300,
  color = "#fff",
  gradient = true,
  customTooltip,
  series,
  secondarySeries,
}: LineChartProps) {
  const gradientId = "lineGradient"

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
        />
        {secondarySeries?.length ? (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
        ) : null}
        <Tooltip
          content={customTooltip ? (p) => customTooltip(p as any) : undefined}
          contentStyle={TOOLTIP_CONTENT_STYLE}
        />
        {series?.length ? series.map((item) => (
          <Line key={item.dataKey} type="monotone" dataKey={item.dataKey} name={item.name} stroke={item.color} strokeWidth={2} dot={false} yAxisId="left" />
        )) : (
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={gradient ? `url(#${gradientId})` : "none"}
            yAxisId="left"
          />
        )}
        {secondarySeries?.map((item) => (
          <Line key={item.dataKey} type="monotone" dataKey={item.dataKey} name={item.name} stroke={item.color} strokeWidth={2} dot={false} yAxisId="right" />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
