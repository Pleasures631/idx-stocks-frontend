"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { StockLineChart } from "@/components/charts/line-chart"
import { VolumeBarChart } from "@/components/charts/bar-chart"
import { mockBrokerSummary } from "@/lib/mock"
import { stocksService } from "@/services/stocks"
import type { StockListItem } from "@/types"
import { formatPercent, formatBigNumber, formatIDR } from "@/lib/utils"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState, useEffect } from "react"

interface StockMover {
  ticker: string
  name: string
  price: number
  change: number
}

function generatePriceHistory(currentPrice: number) {
  const data = []
  for (let i = 7; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const variation = 1 + (Math.random() - 0.5) * 0.06
    data.push({
      date: date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" }),
      value: Math.round(currentPrice * variation),
    })
  }
  return data
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function BrokerTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broker</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

interface StockDetailPageProps {
  ticker: string
}

export function StockDetailPage({ ticker }: StockDetailPageProps) {
  const [stock, setStock] = useState<StockMover | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    stocksService
      .getStockList()
      .then((list: StockListItem[]) => {
        if (!active) return
        const found = list.find((s) => s.stock_code === ticker.toUpperCase())
        if (!found) {
          setStock(null)
          return
        }
        setStock({
          ticker: found.stock_code,
          name: found.stock_name,
          price: found.last_price,
          change: found.change_pct,
        })
      })
      .catch(() => {
        if (active) setStock(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [ticker])

  if (!loading && !stock) return notFound()
  if (!stock) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
      </div>
    )
  }

  const priceHistory = generatePriceHistory(stock.price)
  const volumeData = mockBrokerSummary.slice(0, 8).map((b) => ({
    name: b.IDFirm,
    value: b.Volume,
  }))

  return (
    <div className="space-y-6">
      <Link href="/stocks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Stocks
      </Link>

      {loading ? <HeaderSkeleton /> : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{stock.ticker}</h1>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">Rp{stock.price.toLocaleString()}</span>
            <Badge variant={stock.change >= 0 ? "success" : "destructive"}>
              {stock.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {formatPercent(stock.change)}
            </Badge>
          </div>
        </div>
      )}

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="chart" className="flex-1 sm:flex-none">Price Chart</TabsTrigger>
          <TabsTrigger value="volume" className="flex-1 sm:flex-none">Volume</TabsTrigger>
          <TabsTrigger value="brokers" className="flex-1 sm:flex-none">Broker Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          {loading ? <ChartSkeleton /> : (
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
                <CardDescription>Last 8 trading days</CardDescription>
              </CardHeader>
              <CardContent>
                <StockLineChart data={priceHistory} color="#a1a1aa" height={350} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="volume">
          {loading ? <ChartSkeleton /> : (
            <Card>
              <CardHeader>
                <CardTitle>Volume Distribution</CardTitle>
                <CardDescription>Volume by broker</CardDescription>
              </CardHeader>
              <CardContent>
                <VolumeBarChart data={volumeData} height={300} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="brokers">
          {loading ? <BrokerTableSkeleton /> : (
            <Card>
              <CardHeader>
                <CardTitle>Broker Summary</CardTitle>
                <CardDescription>Top brokers trading {stock.ticker}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Broker</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBrokerSummary.map((broker) => (
                      <TableRow key={broker.IDBrokerSummary}>
                        <TableCell>
                          <div className="font-medium">{broker.IDFirm}</div>
                          <div className="text-xs text-muted-foreground">{broker.FirmName}</div>
                        </TableCell>
                        <TableCell className="text-right">{formatBigNumber(broker.Volume)}</TableCell>
                        <TableCell className="text-right">{formatIDR(broker.Value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
