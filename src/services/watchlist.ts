import type { WatchlistItem } from "@/types"

const STORAGE_KEY = "watchlist-items"

export const watchlistService = {
  getAll(): WatchlistItem[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  add(ticker: string, name: string): WatchlistItem {
    const items = this.getAll()
    const exists = items.find((i) => i.ticker === ticker)
    if (exists) return exists
    const newItem: WatchlistItem = {
      id: crypto.randomUUID(),
      ticker,
      name,
      added_at: new Date().toISOString(),
    }
    items.push(newItem)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return newItem
  },

  remove(id: string): boolean {
    const items = this.getAll()
    const filtered = items.filter((i) => i.id !== id)
    if (filtered.length === items.length) return false
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },
}
