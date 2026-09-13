"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Star,
  Settings,
  GraduationCap,
  ListChecks,
  Layers3,
  Orbit,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react"
import { useState } from "react"
import { BrandMark } from "@/components/brand/brand-mark"
import { useAuthStore } from "@/stores/auth-store"
import { hasFeatureAccess, type PremiumFeature } from "@/components/access/locked-feature"

const navItems: { label: string; href: string; icon: typeof LayoutDashboard; feature?: PremiumFeature }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Stocks", href: "/stocks", icon: TrendingUp },
  { label: "Sector", href: "/sectors", icon: Layers3 },
  { label: "Wyckoff", href: "/wyckoff", icon: Orbit, feature: "wyckoff" },
  { label: "Broker Flow Analysis", href: "/broker-flow-backtest", icon: TrendingUp, feature: "brokerFlowBacktest" },
  { label: "Daily 5 Picks", href: "/daily-picks", icon: ListChecks },
  { label: "Portfolio", href: "/portfolio", icon: Briefcase },
  { label: "Watchlist", href: "/watchlist", icon: Star },
  { label: "Edukasi Saham", href: "/education", icon: GraduationCap },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = useAuthStore((state) => state.user?.role === "admin")
  const user = useAuthStore((state) => state.user)

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && <BrandMark className="h-9 w-36 object-contain object-left" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {[...navItems, ...(isAdmin ? [{ label: "Admin", href: "/admin", icon: ShieldCheck }] : [])].map((item) => {
          const isActive = pathname.startsWith(item.href)
          const locked = item.feature && !hasFeatureAccess(user, item.feature)
          const content = <><item.icon className="h-4 w-4 shrink-0" />{!collapsed && <span className="flex-1">{item.label}</span>}{locked && <LockKeyhole className="h-3.5 w-3.5 text-amber-500" />}</>
          return locked ? (
            <div key={item.href} aria-disabled="true" title="Account inactive — contact Telegram/admin for activation" className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60">
              {content}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >{content}</Link>
          )
        })}
      </nav>
    </aside>
  )
}
