import { create } from "zustand"
import type { PortfolioHolding } from "@/types"
import { portfolioService } from "@/services/portfolio"

interface PortfolioState {
  holdings: PortfolioHolding[]
  isLoading: boolean
  loadHoldings: () => void
  addHolding: (data: Omit<PortfolioHolding, "id" | "added_at" | "updated_at">) => void
  updateHolding: (id: string, data: Partial<PortfolioHolding>) => void
  removeHolding: (id: string) => void
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  isLoading: false,

  loadHoldings: () => {
    set({ isLoading: true })
    const holdings = portfolioService.getAll()
    set({ holdings, isLoading: false })
  },

  addHolding: (data) => {
    portfolioService.add(data)
    get().loadHoldings()
  },

  updateHolding: (id, data) => {
    portfolioService.update(id, data)
    get().loadHoldings()
  },

  removeHolding: (id) => {
    portfolioService.delete(id)
    get().loadHoldings()
  },
}))
