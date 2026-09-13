"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, Star, ListChecks, LockKeyhole } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { hasFeatureAccess, type PremiumFeature } from "@/components/access/locked-feature"

const navItems: { label: string; href: string; icon: typeof LayoutDashboard; feature?: PremiumFeature }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Picks", href: "/daily-picks", icon: ListChecks, feature: "dailyPicks" },
  { label: "Stocks", href: "/stocks", icon: TrendingUp },

  { label: "Watchlist", href: "/watchlist", icon: Star },
]

export function BottomNav() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const locked = item.feature && !hasFeatureAccess(user, item.feature)
          if (locked) return <div key={item.href} aria-disabled="true" title="Account inactive — contact Telegram/admin for activation" className="flex min-w-0 cursor-not-allowed flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium text-muted-foreground/60 sm:px-2 sm:text-xs"><LockKeyhole className="h-5 w-5 text-amber-500" /><span>{item.label}</span></div>
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors sm:px-2 sm:text-xs",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
