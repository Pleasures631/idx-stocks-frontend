"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWatchlistStore } from "@/stores/watchlist-store"
import { stocksService } from "@/services/stocks"
import { formatPercent } from "@/lib/utils"
import { Search, Star, TrendingUp, TrendingDown, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function WatchlistPage() {
  const { items, loadItems, addItem, removeItem } = useWatchlistStore()
  const [search, setSearch] = useState("")
  const [allStocks, setAllStocks] = useState<{ ticker: string; name: string; price: number; change: number }[]>([])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    let active = true
    stocksService
      .getStockList()
      .then((list) => {
        if (!active) return
        setAllStocks(
          list.map((s) => ({
            ticker: s.stock_code,
            name: s.stock_name,
            price: s.last_price,
            change: s.change_pct,
          }))
        )
      })
      .catch(() => {
        if (active) setAllStocks([])
      })
    return () => {
      active = false
    }
  }, [])

  const suggestions = allStocks.filter(
    (s) =>
      !items.find((i) => i.ticker === s.ticker) &&
      (s.ticker.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground">Track your favorite stocks</p>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Add stock to watchlist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {search && suggestions.length > 0 && (
        <Card>
          <CardContent className="p-2">
            {suggestions.slice(0, 5).map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => {
                  addItem(stock.ticker, stock.name)
                  setSearch("")
                }}
                className="flex w-full items-center justify-between rounded-md p-2 text-left hover:bg-muted transition-colors"
              >
                <div>
                  <span className="font-medium">{stock.ticker}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{stock.name}</span>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground">Search above to add stocks</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const stockData = allStocks.find((s) => s.ticker === item.ticker)
            return (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">
                      <Link href={`/stocks/${item.ticker}`} className="hover:underline">
                        {item.ticker}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-md p-1 hover:bg-muted"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </CardHeader>
                <CardContent>
                  {stockData ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">Rp{stockData.price.toLocaleString()}</span>
                      <Badge variant={stockData.change >= 0 ? "success" : "destructive"}>
                        {stockData.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercent(stockData.change)}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No price data</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
