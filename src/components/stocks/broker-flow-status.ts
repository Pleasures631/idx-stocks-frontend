import type { StockAnalyze } from "@/types"

export type BrokerFlowStatusVariant = "success" | "warning" | "destructive" | "secondary"

export interface BrokerFlowStatus {
  label: string
  variant: BrokerFlowStatusVariant
  divergence: boolean
}

/**
 * Maps the aggregate API phase to the short label shown in the UI. The
 * dominant broker remains a separate fact; it must not override this status.
 */
export function getBrokerFlowStatus(analyze: Pick<StockAnalyze, "phase" | "retail_absorption">): BrokerFlowStatus {
  if (analyze.retail_absorption || analyze.phase === "DISTRIBUSI (RETAIL ABSORPTION)") {
    return { label: "Distribusi (Retail Absorption)", variant: "warning", divergence: true }
  }

  switch (analyze.phase) {
    case "BIG MONEY ACCUMULATION":
      return { label: "Akumulasi Big Money", variant: "success", divergence: false }
    case "BIG MONEY DISTRIBUTION":
      return { label: "Distribusi Big Money", variant: "destructive", divergence: false }
    case "BROKER BUY / BIG MONEY DISTRIBUTION":
      return { label: "Broker BUY / Big Money SELL", variant: "warning", divergence: true }
    case "BROKER SELL / BIG MONEY ACCUMULATION":
      return { label: "Broker SELL / Big Money BUY", variant: "warning", divergence: true }
    case "MARKET ACCUMULATION":
      return { label: "Akumulasi Pasar", variant: "success", divergence: false }
    case "MARKET DISTRIBUTION":
      return { label: "Distribusi Pasar", variant: "destructive", divergence: false }
    case "INSUFFICIENT DATA":
      return { label: "Data belum cukup", variant: "secondary", divergence: false }
    default:
      return { label: "Belum jelas", variant: "secondary", divergence: false }
  }
}
