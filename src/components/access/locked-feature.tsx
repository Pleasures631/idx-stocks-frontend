"use client"

import { LockKeyhole } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import type { AuthUser } from "@/types"

export const PREMIUM_FEATURES = {
  brokerFlowAnalysis: { label: "Broker Flow Analysis", description: "Analisis broker flow, replay, dan roadmap Wyckoff." },
  brokerFlowBacktest: { label: "Broker Flow Backtest", description: "Evaluasi sinyal broker flow dengan data historis." },
  wyckoff: { label: "Wyckoff", description: "Market Cycle Orbit dan insight fase pasar." },
} as const

export type PremiumFeature = keyof typeof PREMIUM_FEATURES

export function hasFeatureAccess(user: AuthUser | null, feature: PremiumFeature) {
  if (!user) return false
  if (user.role === "admin") return true
  const explicit = user.access?.features?.[feature]
  if (typeof explicit === "boolean") return explicit
  // Older persisted sessions and API fixtures may not carry the summary yet;
  // only an explicit inactive/denied summary should gate the UI.
  if (!user.subscription && !user.access) return true
  return user.subscription?.status === "active" || user.access?.is_active === true || user.access?.active === true
}

export function LockedFeature({ feature }: { feature: PremiumFeature }) {
  const user = useAuthStore((state) => state.user)
  const details = PREMIUM_FEATURES[feature]
  return (
    <Card className="border-amber-500/30 bg-amber-500/5" role="status" data-testid="locked-feature">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><LockKeyhole className="h-4 w-4 text-amber-500" />{details.label} is locked</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{details.description}</p>
        <p>Your account is inactive. Contact us via Telegram or your administrator to activate access.</p>
        {user?.email && <p className="text-xs">Account: {user.email}</p>}
      </CardContent>
    </Card>
  )
}
