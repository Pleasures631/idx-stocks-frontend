"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminService, type AdminAuditEntry, type AdminRole, type AdminUser, type SubscriptionStatus } from "@/services/users"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock3, CreditCard, RefreshCw, Shield, Users } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function errorMessage(error: unknown) {
  const response = error as { response?: { status?: number; data?: { message?: string } } }
  if (response?.response?.status === 403) return "You do not have permission to access admin data."
  const responseMessage = response?.response?.data?.message
  return responseMessage || (error instanceof Error ? error.message : "Something went wrong. Please try again.")
}

function statusVariant(status: SubscriptionStatus): "success" | "warning" | "secondary" {
  if (status === "active") return "success"
  if (status === "expired") return "warning"
  return "secondary"
}

function StatCard({ label, value, icon: Icon, detail }: { label: string; value: number; icon: typeof Users; detail: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="rounded-lg bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></span>
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [audit, setAudit] = useState<AdminAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const userList = await adminService.getUsers()
      setUsers(userList)
      try {
        setAudit(await adminService.getAudit())
      } catch {
        setAudit([])
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

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
    try {
      await adminService.subscriptionAction(user.id, action)
      setFeedback(`${user.name}'s subscription was updated.`)
      await load()
    } catch (err) { setError(errorMessage(err)) } finally { setBusyKey(null) }
  }

  async function runRoleChange(user: AdminUser, role: AdminRole) {
    if (role === user.role || !window.confirm(`Change ${user.name}'s role to ${role}?`)) return
    const key = `role-${user.id}`
    setBusyKey(key); setError(null); setFeedback(null)
    try {
      await adminService.changeRole(user.id, role)
      setFeedback(`${user.name}'s role was changed to ${role}.`)
      await load()
    } catch (err) { setError(errorMessage(err)) } finally { setBusyKey(null) }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">Backoffice</p><h1 className="text-3xl font-bold tracking-tight">Admin overview</h1><p className="mt-1 text-sm text-muted-foreground">Manage access and subscriptions without leaving the dashboard.</p></div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />Refresh</Button>
      </header>

      {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {feedback && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500"><CheckCircle2 className="h-4 w-4 shrink-0" />{feedback}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={summary.total} icon={Users} detail="Registered accounts" />
        <StatCard label="Active subscriptions" value={summary.active} icon={CreditCard} detail="Currently active" />
        <StatCard label="Expired subscriptions" value={summary.expired} icon={Clock3} detail="Need attention" />
        <StatCard label="Administrators" value={summary.admins} icon={Shield} detail="Backoffice access" />
      </div>

      <Card>
        <CardHeader><CardTitle>Users</CardTitle><p className="text-sm text-muted-foreground">Subscription and role controls for every account.</p></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="space-y-3 p-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : users.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No users found.</p> : <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Registered</TableHead><TableHead>Status</TableHead><TableHead>Start date</TableHead><TableHead>Expiry date</TableHead><TableHead className="min-w-[300px]">Actions</TableHead></TableRow></TableHeader><TableBody>{users.map((user) => <TableRow key={user.id}>
            <TableCell><div className="font-medium">{user.name}</div><div className="text-xs text-muted-foreground">{user.email}</div></TableCell>
            <TableCell><select aria-label={`Role for ${user.name}`} className="rounded-md border bg-background px-2 py-1 text-xs" value={user.role} disabled={busyKey === `role-${user.id}`} onChange={(event) => void runRoleChange(user, event.target.value as AdminRole)}><option value="user">user</option><option value="admin">admin</option></select></TableCell>
            <TableCell className="whitespace-nowrap text-sm">{formatDate(user.registration_date)}</TableCell>
            <TableCell><Badge variant={statusVariant(user.subscription_status)}>{user.subscription_status}</Badge></TableCell>
            <TableCell className="whitespace-nowrap text-sm">{formatDate(user.subscription_start_date)}</TableCell>
            <TableCell className="whitespace-nowrap text-sm">{formatDate(user.subscription_expiry_date)}</TableCell>
            <TableCell><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busyKey !== null} onClick={() => void runSubscriptionAction(user, "activate")}>Activate 30d</Button><Button size="sm" variant="outline" disabled={busyKey !== null} onClick={() => void runSubscriptionAction(user, "extend")}>Extend 30d</Button><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={busyKey !== null} onClick={() => void runSubscriptionAction(user, "expire")}>Expire now</Button></div></TableCell>
          </TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Recent audit activity</CardTitle><p className="text-sm text-muted-foreground">Latest administrative changes.</p></CardHeader><CardContent>{audit.length === 0 ? <p className="text-sm text-muted-foreground">No recent activity.</p> : <div className="space-y-4">{audit.slice(0, 8).map((entry, index) => <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0" key={entry.id ?? `${entry.created_at}-${index}`}><div><p className="text-sm font-medium">{entry.action}</p><p className="text-xs text-muted-foreground">{entry.admin_name ? `${entry.admin_name} · ` : ""}{entry.target_user_name ?? "User account"}{entry.note ? ` · ${entry.note}` : ""}</p></div><time className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(entry.created_at)}</time></div>)}</div>}</CardContent></Card>
    </div>
  )
}
