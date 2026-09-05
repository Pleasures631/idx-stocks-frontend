"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { mockStockList } from "@/lib/mock"
import { stocksService } from "@/services/stocks"
import { formatPercent, formatBigNumber } from "@/lib/utils"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface StockRow {
  ticker: string
  name: string
  price: number
  change: number
  volume: number
}

const MockRows: StockRow[] = mockStockList.map((s) => ({
  ticker: s.ticker,
  name: s.name,
  price: s.price,
  change: s.change,
  volume: s.volume,
}))

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
    </TableRow>
  )
}

function MobileCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="space-y-1 text-right">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  )
}

export function StockListPage() {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [stocks, setStocks] = useState<StockRow[]>(MockRows)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const list = await stocksService.getStockList()
        if (!active) return
        const liveByCode = new Map(
          MockRows.map((m) => [
            m.ticker,
            { price: m.price, change: m.change, volume: m.volume },
          ])
        )
        setStocks(
          list.length > 0
            ? list.map((s) => {
                const live = liveByCode.get(s.stock_code)
                return {
                  ticker: s.stock_code,
                  name: s.stock_name,
                  price: live?.price ?? 0,
                  change: live?.change ?? 0,
                  volume: live?.volume ?? 0,
                }
              })
            : MockRows
        )
      } catch {
        if (active) setStocks(MockRows)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filtered = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stocks</h1>
        <p className="text-muted-foreground">Market data & stock screener</p>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ticker or company name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stocks ({loading ? "..." : filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : (
                  filtered.map((stock) => (
                    <TableRow key={stock.ticker}>
                      <TableCell>
                        <Link
                          href={`/stocks/${stock.ticker}`}
                          className="font-bold hover:underline"
                        >
                          {stock.ticker}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{stock.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        Rp{stock.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={stock.change >= 0 ? "success" : "destructive"}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {formatPercent(stock.change)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatBigNumber(stock.volume)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <MobileCardSkeleton key={i} />)
            ) : (
              filtered.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stocks/${stock.ticker}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-bold">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Rp{stock.price.toLocaleString()}</div>
                    <Badge variant={stock.change >= 0 ? "success" : "destructive"} className="text-xs">
                      {formatPercent(stock.change)}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
