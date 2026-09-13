"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Star,
  Settings,
  GraduationCap,
  ListChecks,
  Layers3,
  Orbit,
  LockKeyhole,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { BrandMark } from "@/components/brand/brand-mark"
import { useAuthStore } from "@/stores/auth-store"
import { hasFeatureAccess, type PremiumFeature } from "@/components/access/locked-feature"

const navItems: { label: string; href: string; icon: typeof LayoutDashboard; feature?: PremiumFeature }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Stocks", href: "/stocks", icon: TrendingUp },
  { label: "Sector", href: "/sectors", icon: Layers3 },
  { label: "Wyckoff Universe", href: "/wyckoff", icon: Orbit, feature: "wyckoff" },
  { label: "Daily 5 Picks", href: "/daily-picks", icon: ListChecks, feature: "dailyPicks" },
  { label: "Watchlist", href: "/watchlist", icon: Star },
  { label: "Edukasi Saham", href: "/education", icon: GraduationCap },
  { label: "Settings", href: "/settings", icon: Settings },
]

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle><BrandMark className="h-9 w-36 object-contain object-left" /></SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const locked = item.feature && !hasFeatureAccess(user, item.feature)
            return locked ? (
              <div key={item.href} aria-disabled="true" title="Account inactive — contact Telegram/admin for activation" className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60"><item.icon className="h-4 w-4 shrink-0" /><span className="flex-1">{item.label}</span><LockKeyhole className="h-3.5 w-3.5 text-amber-500" /></div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
