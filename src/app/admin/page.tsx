"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminService, type AdminAuditEntry, type AdminRole, type AdminUser, type SubscriptionStatus } from "@/services/users"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Clock3, CreditCard, Inbox, LogOut, RefreshCw, Search, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function errorMessage(error: unknown) {
  const response = error as { response?: { status?: number; data?: { message?: string } } }
  if (response?.response?.status === 403) return "You do not have permission to access admin data."
  return response?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong. Please try again.")
}

function statusVariant(status: SubscriptionStatus): "success" | "warning" | "secondary" {
  if (status === "active") return "success"
  if (status === "expired") return "warning"
  return "secondary"
}

function StatCard({ label, value, icon: Icon, detail }: { label: string; value: number; icon: typeof Users; detail: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between p-5 sm:p-6">
        <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
        <span className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [audit, setAudit] = useState<AdminAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auditError, setAuditError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null); setAuditError(null)
    try {
      setUsers(await adminService.getUsers())
      try { setAudit(await adminService.getAudit()) } catch (err) { setAudit([]); setAuditError(errorMessage(err)) }
    } catch (err) { setError(errorMessage(err)); setUsers([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const visibleUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) => [user.name, user.email, user.role, user.subscription_status].some((value) => value.toLowerCase().includes(query)))
  }, [searchQuery, users])

  const summary = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => user.subscription_status === "active").length,
    expired: users.filter((user) => user.subscription_status === "expired").length,
    admins: users.filter((user) => user.role === "admin").length,
  }), [users])

  async function runSubscriptionAction(user: AdminUser, action: "activate" | "extend" | "expire") {
    const labels = { activate: "activate a 30-day subscription for", extend: "extend the subscription for", expire: "expire the subscription for" }
    if (!window.confirm(`Are you sure you want to ${labels[action]} ${user.name}?`)) return
    const key = `${action}-${user.id}`
    setBusyKey(key); setError(null); setFeedback(null)
    try { await adminService.subscriptionAction(user.id, action); setFeedback(`${user.name}'s subscription was updated.`); await load() }
    catch (err) { setError(errorMessage(err)) } finally { setBusyKey(null) }
  }

  async function runRoleChange(user: AdminUser, role: AdminRole) {
    if (role === user.role || !window.confirm(`Change ${user.name}'s role to ${role}?`)) return
    const key = `role-${user.id}`
    setBusyKey(key); setError(null); setFeedback(null)
    try { await adminService.changeRole(user.id, role); setFeedback(`${user.name}'s role was changed to ${role}.`); await load() }
    catch (err) { setError(errorMessage(err)) } finally { setBusyKey(null) }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 pb-8">
      <header className="flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Backoffice</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Admin overview</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage access, subscriptions, and administrative activity from one place.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading} aria-label="Refresh admin data"><RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />Refresh</Button>
          <Button variant="ghost" onClick={() => { logout(); router.replace("/login") }} aria-label="Logout admin"><LogOut className="mr-2 h-4 w-4" />Logout</Button>
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-medium">Unable to load admin data</p><p className="mt-1">{error}</p></div></div>}
      {feedback && <div role="status" className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><p>{feedback}</p></div>}

      <section aria-label="User summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total users" value={summary.total} icon={Users} detail="Registered accounts" /><StatCard label="Active subscriptions" value={summary.active} icon={CreditCard} detail="Currently active" /><StatCard label="Expired subscriptions" value={summary.expired} icon={Clock3} detail="Need attention" /><StatCard label="Administrators" value={summary.admins} icon={Shield} detail="Backoffice access" /></section>

      <Card>
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Users</CardTitle><CardDescription>Review account access and manage subscription status. Changes are authorized by the backend.</CardDescription></div><div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search name, email, role..." aria-label="Search users" className="pl-9" /></div></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="space-y-3 p-6" aria-label="Loading users"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : visibleUsers.length === 0 ? <div className="flex flex-col items-center justify-center px-6 py-14 text-center"><Inbox className="mb-3 h-9 w-9 text-muted-foreground/60" /><p className="font-medium">{searchQuery ? "No matching users" : "No users found"}</p><p className="mt-1 text-sm text-muted-foreground">{searchQuery ? "Try another name, email, role, or status." : "There are no accounts to display yet."}</p></div> : <div className="overflow-x-auto"><Table className="min-w-[1080px]"><TableHeader><TableRow className="bg-muted/30"><TableHead className="pl-6">User</TableHead><TableHead>Role</TableHead><TableHead>Registered</TableHead><TableHead>Status</TableHead><TableHead>Start date</TableHead><TableHead>Expiry date</TableHead><TableHead className="pr-6">Actions</TableHead></TableRow></TableHeader><TableBody>{visibleUsers.map((user) => { const roleBusy = busyKey === `role-${user.id}`; return <TableRow key={user.id}>
            <TableCell className="pl-6"><div className="font-medium">{user.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{user.email}</div></TableCell>
            <TableCell><select aria-label={`Role for ${user.name}`} className="rounded-md border bg-background px-2 py-1.5 text-xs capitalize outline-none focus:ring-2 focus:ring-ring" value={user.role} disabled={roleBusy || busyKey !== null} onChange={(event) => void runRoleChange(user, event.target.value as AdminRole)}><option value="user">user</option><option value="admin">admin</option></select></TableCell>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(user.registration_date)}</TableCell><TableCell><Badge variant={statusVariant(user.subscription_status)} className="capitalize">{user.subscription_status}</Badge></TableCell><TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(user.subscription_start_date)}</TableCell><TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(user.subscription_expiry_date)}</TableCell>
            <TableCell className="pr-6"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busyKey !== null} onClick={() => void runSubscriptionAction(user, "activate")} aria-label={`Activate subscription for ${user.name}`}>{busyKey === `activate-${user.id}` && <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />}Activate 30d</Button><Button size="sm" variant="outline" disabled={busyKey !== null} onClick={() => void runSubscriptionAction(user, "extend")} aria-label={`Extend subscription for ${user.name}`}>{busyKey === `extend-${user.id}` && <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />}Extend 30d</Button><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={busyKey !== null} onClick={() => void runSubscriptionAction(user, "expire")} aria-label={`Expire subscription for ${user.name}`}>{busyKey === `expire-${user.id}` && <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />}Expire now</Button></div></TableCell>
          </TableRow> })}</TableBody></Table></div>}
        </CardContent>
      </Card>

      <Card><CardHeader className="gap-2 border-b"><CardTitle>Recent audit activity</CardTitle><CardDescription>Latest administrative changes recorded by the service.</CardDescription></CardHeader><CardContent className="pt-5">{auditError && <p role="status" className="mb-4 text-sm text-amber-600">Audit activity is temporarily unavailable: {auditError}</p>}{audit.length === 0 ? <div className="flex flex-col items-center py-8 text-center"><Inbox className="mb-2 h-7 w-7 text-muted-foreground/60" /><p className="text-sm text-muted-foreground">No recent activity.</p></div> : <div className="space-y-4">{audit.slice(0, 8).map((entry, index) => <div className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4" key={entry.id ?? `${entry.created_at}-${index}`}><div><p className="text-sm font-medium">{entry.action}</p><p className="text-xs text-muted-foreground">{entry.admin_name ? `${entry.admin_name} · ` : ""}{entry.target_user_name ?? "User account"}{entry.note ? ` · ${entry.note}` : ""}</p></div><time className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(entry.created_at)}</time></div>)}</div>}</CardContent></Card>
    </div>
  )
}
