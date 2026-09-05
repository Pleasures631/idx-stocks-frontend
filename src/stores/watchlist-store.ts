import { create } from "zustand"
import type { WatchlistItem } from "@/types"
import { watchlistService } from "@/services/watchlist"

interface WatchlistState {
  items: WatchlistItem[]
  isLoading: boolean
  loadItems: () => void
  addItem: (ticker: string, name: string) => void
  removeItem: (id: string) => void
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: [],
  isLoading: false,

  loadItems: () => {
    set({ isLoading: true })
    const items = watchlistService.getAll()
    set({ items, isLoading: false })
  },

  addItem: (ticker, name) => {
    watchlistService.add(ticker, name)
    get().loadItems()
  },

  removeItem: (id) => {
    watchlistService.remove(id)
    get().loadItems()
  },
}))
