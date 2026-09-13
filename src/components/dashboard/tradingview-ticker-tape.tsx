"use client"

import { useEffect, useRef } from "react"

const tickerConfig = {
  symbols: [
    { description: "IHSG", proName: "IDX:COMPOSITE" },
    { description: "LQ45", proName: "IDX:LQ45" },
    { description: "Pefindo i-Grade", proName: "IDX:I_GRADE" },
    { description: "USD", proName: "FX_IDC:USDIDR" },
    { description: "Gold", proName: "FX_IDC:XAUIDR" },
  ],
  showSymbolLogo: true,
  isTransparent: false,
  displayMode: "adaptive",
  colorTheme: "light",
  width: "100%",
  height: 74,
  locale: "id",
}

export function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""
    const widget = document.createElement("div")
    widget.className = "tradingview-widget-container__widget"
    container.appendChild(widget)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify(tickerConfig)
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [])

  return (
    <div className="rounded-lg border bg-card p-1 shadow-sm">
      <div ref={containerRef} className="tradingview-widget-container min-h-[74px] w-full" />
    </div>
  )
}
