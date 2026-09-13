"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Building2, ChevronRight, CircleHelp, Cpu, Factory, Flame, Gem, HeartPulse, Landmark, Layers3, Leaf, Network, RefreshCw, Search, ShoppingBag, ShoppingBasket, Truck, type LucideIcon } from "lucide-react"

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

type SectorVisual = {
  icon: LucideIcon
  bar: string
  border: string
  iconBackground: string
  iconColor: string
}

const SECTOR_VISUALS: SectorVisual[] = [
  { icon: Landmark, bar: "bg-violet-400", border: "hover:border-violet-300/60", iconBackground: "bg-violet-400/15", iconColor: "text-violet-200" },
  { icon: Building2, bar: "bg-sky-400", border: "hover:border-sky-300/60", iconBackground: "bg-sky-400/15", iconColor: "text-sky-200" },
  { icon: Factory, bar: "bg-orange-400", border: "hover:border-orange-300/60", iconBackground: "bg-orange-400/15", iconColor: "text-orange-200" },
  { icon: Leaf, bar: "bg-emerald-400", border: "hover:border-emerald-300/60", iconBackground: "bg-emerald-400/15", iconColor: "text-emerald-200" },
  { icon: ShoppingBasket, bar: "bg-pink-400", border: "hover:border-pink-300/60", iconBackground: "bg-pink-400/15", iconColor: "text-pink-200" },
  { icon: ShoppingBag, bar: "bg-rose-400", border: "hover:border-rose-300/60", iconBackground: "bg-rose-400/15", iconColor: "text-rose-200" },
  { icon: HeartPulse, bar: "bg-red-400", border: "hover:border-red-300/60", iconBackground: "bg-red-400/15", iconColor: "text-red-200" },
  { icon: Cpu, bar: "bg-cyan-400", border: "hover:border-cyan-300/60", iconBackground: "bg-cyan-400/15", iconColor: "text-cyan-200" },
  { icon: Flame, bar: "bg-amber-400", border: "hover:border-amber-300/60", iconBackground: "bg-amber-400/15", iconColor: "text-amber-200" },
  { icon: Gem, bar: "bg-fuchsia-400", border: "hover:border-fuchsia-300/60", iconBackground: "bg-fuchsia-400/15", iconColor: "text-fuchsia-200" },
  { icon: Network, bar: "bg-indigo-400", border: "hover:border-indigo-300/60", iconBackground: "bg-indigo-400/15", iconColor: "text-indigo-200" },
  { icon: Truck, bar: "bg-lime-400", border: "hover:border-lime-300/60", iconBackground: "bg-lime-400/15", iconColor: "text-lime-200" },
]

function sectorVisual(sector: string, fallbackIndex: number): SectorVisual {
  const normalized = sector.toLowerCase()
  if (normalized === UNCATEGORIZED.toLowerCase()) {
    return { icon: CircleHelp, bar: "bg-slate-400", border: "hover:border-slate-300/60", iconBackground: "bg-slate-400/15", iconColor: "text-slate-200" }
  }

  const keywordIndex = ([
    ["keuangan", 0],
    ["infrastruktur", 1],
    ["industri", 2],
    ["barang baku", 3],
    ["bahan baku", 3],
    ["konsumen primer", 4],
    ["konsumen non-primer", 5],
    ["kesehatan", 6],
    ["teknologi", 7],
    ["energi", 8],
    ["properti", 9],
    ["real estat", 9],
    ["transportasi", 10],
    ["logistik", 10],
  ] as Array<[string, number]>).find(([keyword]) => normalized.includes(keyword))?.[1]
  if (keywordIndex != null) return SECTOR_VISUALS[keywordIndex]

  return SECTOR_VISUALS[fallbackIndex % SECTOR_VISUALS.length]
}

function SectorCard({ sector, count, visualIndex, onClick }: { sector: string; count: number; visualIndex: number; onClick: () => void }) {
  const visual = sectorVisual(sector, visualIndex)
  const Icon = visual.icon

  return (
    <button type="button" onClick={onClick} className="group w-full text-left">
      <Card className={`relative overflow-hidden border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/40 ${visual.border}`}>
        <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${visual.bar}`} />
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.iconBackground} ${visual.iconColor}`}>
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <CardTitle className="truncate text-base">{sector}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 border-border/80 bg-background/70 font-semibold text-foreground">{count} emiten</Badge>
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
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
                {visibleSectors.map(([sector, sectorStocks]) => {
                  const visualIndex = groupedSectors.findIndex(([groupSector]) => groupSector === sector)
                  return <SectorCard key={sector} sector={sector} count={sectorStocks.length} visualIndex={visualIndex} onClick={() => { setSelectedSector(sector); setSearch("") }} />
                })}
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
