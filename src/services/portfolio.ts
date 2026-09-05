import type { PortfolioHolding } from "@/types"

const STORAGE_KEY = "portfolio-holdings"

export const portfolioService = {
  getAll(): PortfolioHolding[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  getById(id: string): PortfolioHolding | undefined {
    return this.getAll().find((h) => h.id === id)
  },

  add(holding: Omit<PortfolioHolding, "id" | "added_at" | "updated_at">): PortfolioHolding {
    const holdings = this.getAll()
    const newHolding: PortfolioHolding = {
      ...holding,
      id: crypto.randomUUID(),
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    holdings.push(newHolding)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
    return newHolding
  },

  update(id: string, data: Partial<PortfolioHolding>): PortfolioHolding | null {
    const holdings = this.getAll()
    const index = holdings.findIndex((h) => h.id === id)
    if (index === -1) return null
    holdings[index] = { ...holdings[index], ...data, updated_at: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
    return holdings[index]
  },

  delete(id: string): boolean {
    const holdings = this.getAll()
    const filtered = holdings.filter((h) => h.id !== id)
    if (filtered.length === holdings.length) return false
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  getSummary(holdings: PortfolioHolding[]) {
    const totalInvestment = holdings.reduce((sum, h) => sum + h.lot * 100 * h.avg_price, 0)
    const totalShares = holdings.reduce((sum, h) => sum + h.lot * 100, 0)
    return {
      total_investment: totalInvestment,
      total_shares: totalShares,
      total_holdings: holdings.length,
    }
  },
}
