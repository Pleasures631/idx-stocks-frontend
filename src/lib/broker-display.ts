const RETAIL_GROUPS = new Set(["RETAIL", "RITEL"])
const GOVERNMENT_GROUPS = new Set(["GOVERNMENT", "PEMERINTAH", "GOV"])
const FOREIGN_GROUPS = new Set(["FOREIGN", "ASING"])

function classificationClassName(classification?: string | null): string | null {
  const normalized = classification?.trim().toUpperCase() ?? ""
  if (RETAIL_GROUPS.has(normalized)) return "text-violet-600 dark:text-violet-400"
  if (GOVERNMENT_GROUPS.has(normalized)) return "text-emerald-600 dark:text-emerald-400"
  if (FOREIGN_GROUPS.has(normalized)) return "text-red-600 dark:text-red-400"
  return null
}

/**
 * Color a broker code using the canonical broker_group first. broker_type is a
 * fallback for older payloads that do not expose the canonical group.
 */
export function brokerCodeClassName(brokerGroup?: string | null, brokerType?: string | null): string {
  const canonical = classificationClassName(brokerGroup)
  const fallback = canonical ?? classificationClassName(brokerType)
  if (fallback) return fallback
  return "text-foreground"
}

export function brokerGroupBadgeClassName(group?: string | null): string {
  const normalized = group?.trim().toUpperCase() ?? ""
  if (RETAIL_GROUPS.has(normalized)) return "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300"
  if (GOVERNMENT_GROUPS.has(normalized)) return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
  if (FOREIGN_GROUPS.has(normalized)) return "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300"
  return "bg-muted text-muted-foreground border-border"
}
