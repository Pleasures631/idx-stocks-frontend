"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StockLineChart } from "@/components/charts/line-chart"
import { mockIHSGData, mockStockList } from "@/lib/mock"
import { formatPercent, formatBigNumber } from "@/lib/utils"
import { TrendingUp, TrendingDown, Briefcase, BarChart3, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const gainers = mockStockList
  .filter((s) => s.change > 0)
  .sort((a, b) => b.change - a.change)
  .slice(0, 5)

const losers = mockStockList
  .filter((s) => s.change < 0)
  .sort((a, b) => a.change - b.change)
  .slice(0, 5)

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  )
}

function StockListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Market overview and portfolio summary</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IHSG Index</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7,400</div>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +0.68% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBigNumber(216000000000)}</div>
                <p className="text-xs text-muted-foreground">Across all tickers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CUAN</div>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {formatPercent(5.56)} | Rp190
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp0</div>
                <p className="text-xs text-muted-foreground">
                  <Link href="/portfolio" className="underline hover:no-underline">Add holdings</Link>
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IHSG Performance</CardTitle>
          <CardDescription>Composite Index - Last 8 trading days</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : (
            <StockLineChart data={mockIHSGData} color="#a1a1aa" height={280} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <StockListSkeleton /> : (
              <div className="space-y-2">
                {gainers.map((stock) => (
                  <Link
                    key={stock.ticker}
                    href={`/stocks/${stock.ticker}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                  >
                    <div>
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Rp{stock.price.toLocaleString()}</div>
                      <Badge variant="success" className="text-xs">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {formatPercent(stock.change)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <StockListSkeleton /> : (
              <div className="space-y-2">
                {losers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No losers today</p>
                ) : (
                  losers.map((stock) => (
                    <Link
                      key={stock.ticker}
                      href={`/stocks/${stock.ticker}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                    >
                      <div>
                        <div className="font-medium">{stock.ticker}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rp{stock.price.toLocaleString()}</div>
                        <Badge variant="destructive" className="text-xs">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {formatPercent(stock.change)}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
