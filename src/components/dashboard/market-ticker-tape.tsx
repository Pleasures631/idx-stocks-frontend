const marketInstruments = [
  { symbol: "IHSG", label: "IDX Composite" },
  { symbol: "LQ45", label: "IDX LQ45" },
  { symbol: "IDX30", label: "IDX30" },
  { symbol: "USD/IDR", label: "US dollar / rupiah" },
  { symbol: "XAU/IDR", label: "Gold / rupiah" },
]

/**
 * Local, dependency-free market instrument strip.
 *
 * Prices and changes are intentionally not fabricated here. Live values are
 * shown by the dashboard cards from the configured backend market provider.
 */
export function MarketTickerTape() {
  return (
    <section aria-label="Market instruments" className="overflow-hidden rounded-lg border bg-card p-1 shadow-sm">
      <ul className="flex min-h-[74px] items-center gap-2 overflow-x-auto px-2 py-3 scrollbar-hide">
        {marketInstruments.map((instrument) => (
          <li key={instrument.symbol} className="min-w-[150px] shrink-0 rounded-md border bg-background px-3 py-2">
            <p className="text-sm font-semibold">{instrument.symbol}</p>
            <p className="text-xs text-muted-foreground">{instrument.label}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
