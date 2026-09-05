"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AllocationPieChart } from "@/components/charts/pie-chart"
import { usePortfolioStore } from "@/stores/portfolio-store"
import { stocksService } from "@/services/stocks"
import { formatIDR, formatPercent, formatBigNumber } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { portfolioSchema, type PortfolioFormData } from "@/lib/validators"
import { Plus, Briefcase, TrendingUp, TrendingDown, Trash2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

const FALLBACK_BROKERS = ["YP", "CC", "PD", "NI", "BK", "MG", "BI", "AR"]

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
  )
}

function MobileCardSkeleton() {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PortfolioPage() {
  const { holdings, loadHoldings, addHolding, removeHolding } = usePortfolioStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [priceByTicker, setPriceByTicker] = useState<Map<string, { price: number; change: number }>>(new Map())

  useEffect(() => {
    loadHoldings()
    const timer = setTimeout(() => setLoading(false), 600)
    stocksService
      .getStockList()
      .then((list) => {
        const map = new Map<string, { price: number; change: number }>()
        for (const s of list) {
          map.set(s.stock_code, { price: s.last_price, change: s.change_pct })
        }
        setPriceByTicker(map)
      })
      .catch(() => {})
    return () => clearTimeout(timer)
  }, [loadHoldings])

  const totalInvestment = holdings.reduce((sum, h) => sum + h.lot * 100 * h.avg_price, 0)

  const brokerAllocation = holdings.reduce(
    (acc, h) => {
      const val = h.lot * 100 * h.avg_price
      acc[h.broker] = (acc[h.broker] || 0) + val
      return acc
    },
    {} as Record<string, number>
  )

  const tickerAllocation = holdings.reduce(
    (acc, h) => {
      const val = h.lot * 100 * h.avg_price
      acc[h.ticker] = (acc[h.ticker] || 0) + val
      return acc
    },
    {} as Record<string, number>
  )

  const brokerChartData = Object.entries(brokerAllocation).map(([name, value]) => ({ name, value }))
  const tickerChartData = Object.entries(tickerAllocation).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Track your holdings & performance</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-11">
          <Plus className="h-4 w-4 mr-2" /> Add Holding
        </Button>
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
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatIDR(totalInvestment)}</div>
                <p className="text-xs text-muted-foreground">{holdings.length} holdings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatIDR(totalInvestment * 1.05)}</div>
                <p className="text-xs text-emerald-500">+5.0% (estimated)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unrealized P/L</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">
                  {formatIDR(totalInvestment * 0.05)}
                </div>
                <p className="text-xs text-emerald-500">{formatPercent(5)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBigNumber(holdings.reduce((sum, h) => sum + h.lot * 100, 0))}
                </div>
                <p className="text-xs text-muted-foreground">Shares owned</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {!loading && holdings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Allocation by Ticker</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationPieChart data={tickerChartData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Allocation by Broker</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationPieChart data={brokerChartData} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead className="text-right">Lot</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                      <TableHead className="text-right">Investment</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <MobileCardSkeleton key={i} />)}
              </div>
            </>
          ) : holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No holdings yet</p>
              <p className="text-sm text-muted-foreground">Click &quot;Add Holding&quot; to start</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead className="text-right">Lot</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                      <TableHead className="text-right">Investment</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((h) => {
                      const live = priceByTicker.get(h.ticker)
                      const currentPrice = live?.price ?? h.avg_price
                      const currentValue = h.lot * 100 * currentPrice
                      const investment = h.lot * 100 * h.avg_price
                      const gainLoss = investment > 0 ? ((currentValue - investment) / investment) * 100 : 0

                      return (
                        <TableRow key={h.id}>
                          <TableCell className="font-bold">{h.ticker}</TableCell>
                          <TableCell className="text-right">{h.lot}</TableCell>
                          <TableCell className="text-right">{(h.lot * 100).toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatIDR(h.avg_price)}</TableCell>
                          <TableCell className="text-right">{formatIDR(investment)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{h.broker}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeHolding(h.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-2">
                {holdings.map((h) => {
                  const live = priceByTicker.get(h.ticker)
                  const currentPrice = live?.price ?? h.avg_price
                  const currentValue = h.lot * 100 * currentPrice
                  const investment = h.lot * 100 * h.avg_price
                  const gainLoss = investment > 0 ? ((currentValue - investment) / investment) * 100 : 0

                  return (
                    <div key={h.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold">{h.ticker}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{h.broker}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeHolding(h.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Lot: </span>
                          <span className="font-medium">{h.lot}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg: </span>
                          <span className="font-medium">{formatIDR(h.avg_price)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Invested: </span>
                          <span className="font-medium">{formatIDR(investment)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">P/L: </span>
                          <span className={`font-medium ${gainLoss >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {formatPercent(gainLoss)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddHoldingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function AddHoldingDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addHolding } = usePortfolioStore()
  const [submitting, setSubmitting] = useState(false)
  const [brokers, setBrokers] = useState<string[]>([])
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { ticker: "", lot: 1, avg_price: 0, broker: "" },
  })

  useEffect(() => {
    let active = true
    stocksService
      .getBrokerList()
      .then((list) => {
        if (!active) return
        const codes = list.map((b) => b.broker_code).filter(Boolean)
        setBrokers(codes.length > 0 ? codes : FALLBACK_BROKERS)
      })
      .catch(() => {
        if (active) setBrokers(FALLBACK_BROKERS)
      })
    return () => {
      active = false
    }
  }, [])

  const onSubmit = (data: PortfolioFormData) => {
    setSubmitting(true)
    setTimeout(() => {
      addHolding({
        ticker: data.ticker.toUpperCase(),
        lot: data.lot,
        avg_price: data.avg_price,
        broker: data.broker,
      })
      reset()
      setSubmitting(false)
      onOpenChange(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
          <DialogDescription>Add a new stock to your portfolio</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker</Label>
            <Input
              id="ticker"
              placeholder="e.g. BBCA"
              {...register("ticker")}
              className="h-11 uppercase"
            />
            {errors.ticker && <p className="text-xs text-destructive">{errors.ticker.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot">Lot (1 lot = 100 shares)</Label>
            <Input
              id="lot"
              type="number"
              min="1"
              {...register("lot", { valueAsNumber: true })}
              className="h-11"
            />
            {errors.lot && <p className="text-xs text-destructive">{errors.lot.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg_price">Average Buy Price (IDR)</Label>
            <Input
              id="avg_price"
              type="number"
              min="1"
              {...register("avg_price", { valueAsNumber: true })}
              className="h-11"
            />
            {errors.avg_price && <p className="text-xs text-destructive">{errors.avg_price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Broker</Label>
            <Select onValueChange={(val) => setValue("broker", val)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select broker" />
              </SelectTrigger>
              <SelectContent>
                {brokers.length === 0
                  ? FALLBACK_BROKERS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))
                  : brokers.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.broker && <p className="text-xs text-destructive">{errors.broker.message}</p>}
          </div>
          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add to Portfolio"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
