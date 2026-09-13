"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ChevronRight, Search, Layers3, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { stocksService } from "@/services/stocks"
import type { StockListItem } from "@/types"

const UNCATEGORIZED = "Belum diklasifikasikan"

function sectorName(stock: StockListItem) {
  return stock.sector.trim() || UNCATEGORIZED
}

function SectorCard({ sector, count, onClick }: { sector: string; count: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card className="transition-colors hover:border-primary/50 hover:bg-muted/40">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">{sector}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{count} emiten</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    </button>
  )
}

function StockCard({ stock }: { stock: StockListItem }) {
  return (
    <Link href={`/stocks/${stock.stock_code}`} className="rounded-md border p-3 transition-colors hover:bg-muted">
      <div className="font-semibold">{stock.stock_code}</div>
      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{stock.stock_name}</div>
      {stock.sub_sector && <div className="mt-2 text-xs text-muted-foreground">{stock.sub_sector}</div>}
    </Link>
  )
}

export function SectorListPage() {
  const [stocks, setStocks] = useState<StockListItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    stocksService.getStockList()
      .then((list) => {
        if (active) setStocks(list)
      })
      .catch(() => {
        if (active) {
          setStocks([])
          setError("Gagal memuat pengelompokan sector. Periksa koneksi ke server, lalu coba lagi.")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  const groupedSectors = useMemo(() => {
    const groups = new Map<string, StockListItem[]>()
    for (const stock of stocks) {
      const sector = sectorName(stock)
      const group = groups.get(sector) ?? []
      group.push(stock)
      groups.set(sector, group)
    }
    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right, "id"))
      .map(([sector, sectorStocks]) => [sector, sectorStocks.sort((left, right) => left.stock_code.localeCompare(right.stock_code))] as const)
  }, [stocks])

  const visibleSectors = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query || selectedSector) return groupedSectors
    return groupedSectors.filter(([sector]) => sector.toLowerCase().includes(query))
  }, [groupedSectors, search, selectedSector])

  const selectedStocks = useMemo(() => {
    if (!selectedSector) return []
    const group = groupedSectors.find(([sector]) => sector === selectedSector)?.[1] ?? []
    const query = search.trim().toLowerCase()
    if (!query) return group
    return group.filter((stock) => [stock.stock_code, stock.stock_name, stock.sub_sector, stock.industry, stock.sub_industry]
      .some((value) => value.toLowerCase().includes(query)))
  }, [groupedSectors, search, selectedSector])

  const totalStockCount = stocks.length

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Sector</h1>
        </div>
        <p className="text-muted-foreground">Pilih sector untuk melihat daftar emitennya.</p>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={selectedSector ? "Cari ticker atau nama emiten..." : "Cari sector..."}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
              <CardContent><div className="grid gap-2 sm:grid-cols-2">{Array.from({ length: 4 }).map((__, itemIndex) => <Skeleton key={itemIndex} className="h-16" />)}</div></CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="text-sm font-medium text-destructive">{error}</div>
            <Button variant="outline" onClick={() => setReloadKey((value) => value + 1)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {selectedSector ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Button variant="ghost" className="-ml-3 mb-1" onClick={() => { setSelectedSector(null); setSearch("") }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Semua sector
                  </Button>
                  <div className="text-sm text-muted-foreground">{selectedSector} · {selectedStocks.length} emiten</div>
                </div>
              </div>
              {selectedStocks.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedStocks.map((stock) => <StockCard key={stock.stock_code} stock={stock} />)}
                </div>
              ) : (
                <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Tidak ada emiten yang cocok dengan pencarian.</CardContent></Card>
              )}
            </>
          ) : visibleSectors.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">{groupedSectors.length} sector · {totalStockCount} emiten</div>
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleSectors.map(([sector, sectorStocks]) => <SectorCard key={sector} sector={sector} count={sectorStocks.length} onClick={() => { setSelectedSector(sector); setSearch("") }} />)}
              </div>
            </>
          ) : (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Tidak ada emiten yang cocok dengan pencarian.</CardContent></Card>
          )}
        </>
      )}
    </div>
  )
}
