"use client"

import {
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface BarChartProps {
  data: { name: string; value?: number; buy?: number; sell?: number }[]
  height?: number
  color?: string
}

export function VolumeBarChart({ data, height = 200, color = "#52525b" }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--popover-foreground))",
          }}
        />
        {data.some((item) => item.buy !== undefined || item.sell !== undefined) ? (
          <>
            <Legend />
            <Bar dataKey="buy" name="Buy" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sell" name="Sell" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </>
        ) : (
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
