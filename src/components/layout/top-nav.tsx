"use client"

import { Search, Moon, Sun, LogOut, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MobileDrawer } from "./mobile-drawer"
import { stocksService } from "@/services/stocks"
import type { StockListItem } from "@/types"

export function TopNav() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [stocks, setStocks] = useState<StockListItem[]>([])

  useEffect(() => {
    let active = true
    stocksService.getStockList().then((list) => {
      if (active) setStocks(list)
    }).catch(() => {
      if (active) setStocks([])
    })
    return () => {
      active = false
    }
  }, [])

  const suggestions = search.trim()
    ? stocks.filter((stock) => {
        const query = search.toLowerCase()
        return stock.stock_code.toLowerCase().includes(query) || stock.stock_name.toLowerCase().includes(query)
      }).slice(0, 8)
    : []

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center gap-2 md:gap-4">
          <div className="relative hidden sm:block flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search stocks..."
              className="flex h-9 w-full rounded-md border border-input bg-muted/50 pl-8 pr-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-popover shadow-md">
                {suggestions.map((stock) => (
                  <button
                    key={stock.stock_code}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      setSearch("")
                      router.push(`/stocks/${stock.stock_code}`)
                    }}
                  >
                    <span className="font-medium">{stock.stock_code}</span>
                    <span className="ml-3 truncate text-xs text-muted-foreground">{stock.stock_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
