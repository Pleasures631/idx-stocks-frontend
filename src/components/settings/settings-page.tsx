"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import apiClient from "@/lib/api-client"
import { accountService } from "@/services/account"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Download, LogOut, Loader2, Moon, Sun, Trash2, User, Shield } from "lucide-react"
import { useEffect, useState } from "react"

const DELETE_CONFIRMATION = "DELETE MY ACCOUNT"

type Feedback = { type: "success" | "error"; message: string } | null

export function SettingsPage() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "unavailable">("checking")
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [accountFeedback, setAccountFeedback] = useState<Feedback>(null)

  useEffect(() => {
    apiClient.get("/health", { skipAuthRefresh: true, skipLoading: true })
      .then(() => setApiStatus("connected"))
      .catch(() => setApiStatus("unavailable"))
  }, [])

  const handleLogout = () => { logout(); router.push("/login") }

  const handleExport = async () => {
    setExporting(true)
    setAccountFeedback(null)
    try {
      const data = await accountService.exportData()
      const json = typeof data === "string" ? data : JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `yapping-saham-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setAccountFeedback({ type: "success", message: "Ekspor data berhasil diunduh." })
    } catch {
      setAccountFeedback({ type: "error", message: "Ekspor data gagal. Silakan coba lagi." })
    } finally { setExporting(false) }
  }

  const handleDelete = async () => {
    if (confirmation !== DELETE_CONFIRMATION) return
    setDeleting(true)
    setAccountFeedback(null)
    try {
      await accountService.deleteAccount()
      logout()
      router.replace("/login")
    } catch {
      setAccountFeedback({ type: "error", message: "Permintaan penghapusan gagal. Akun Anda belum dihapus." })
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="text-muted-foreground">Manage your account and preferences</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle><CardDescription>Your account information</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><p className="text-sm font-medium">Name</p><p className="text-sm text-muted-foreground">{user?.name || "Guest"}</p></div><Separator />
          <div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">{user?.email || "Not logged in"}</p></div><Separator />
          <div><p className="text-sm font-medium">Member Since</p><p className="text-sm text-muted-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" /> Appearance</CardTitle><CardDescription>Customize the look and feel</CardDescription></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Theme</p><p className="text-sm text-muted-foreground">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p></div><Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}Switch to {theme === "dark" ? "Light" : "Dark"}</Button></div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> API Configuration</CardTitle><CardDescription>Backend API connection</CardDescription></CardHeader>
        <CardContent className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">API Base URL</p><p className="font-mono text-xs text-muted-foreground">{process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}</p></div><div className={`h-2 w-2 rounded-full ${apiStatus === "connected" ? "bg-emerald-500" : apiStatus === "unavailable" ? "bg-red-500" : "bg-amber-500"}`} title={apiStatus === "connected" ? "Connected" : apiStatus === "unavailable" ? "Unavailable" : "Checking"} /></div><Separator /><div><p className="text-sm font-medium">Data Source</p><p className="text-sm text-muted-foreground">indonesia-stocks-api (IDX + Exodus)</p></div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data & account</CardTitle><CardDescription>Kelola salinan data dan permintaan penghapusan akun.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {accountFeedback && <div role="status" className={`rounded-md p-3 text-sm ${accountFeedback.type === "error" ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}>{accountFeedback.message}</div>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">Ekspor data saya</p><p className="text-sm text-muted-foreground">Unduh salinan JSON dari data yang tersedia untuk akun Anda.</p></div><Button variant="outline" onClick={handleExport} disabled={exporting}>{exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}{exporting ? "Menyiapkan..." : "Unduh data"}</Button></div>
          <Separator />
          <div className="space-y-3"><div><p className="text-sm font-medium text-destructive">Hapus akun</p><p className="text-sm text-muted-foreground">Tindakan ini meminta penghapusan akun dan tidak dapat dibatalkan.</p></div><label htmlFor="delete-confirmation" className="text-sm">Ketik <span className="font-mono font-semibold">{DELETE_CONFIRMATION}</span> untuk melanjutkan</label><Input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={DELETE_CONFIRMATION} autoComplete="off" /><Button variant="destructive" onClick={handleDelete} disabled={deleting || confirmation !== DELETE_CONFIRMATION}>{deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}{deleting ? "Memproses..." : "Minta hapus akun"}</Button></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Legal</CardTitle><CardDescription>Baca informasi privasi, ketentuan, dan risiko investasi.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-4 text-sm"><a href="/privacy" className="underline hover:no-underline">Kebijakan Privasi</a><a href="/terms" className="underline hover:no-underline">Syarat & Ketentuan</a><a href="/disclaimer" className="underline hover:no-underline">Disclaimer Investasi</a></CardContent></Card>
      <Card className="border-destructive/50"><CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><LogOut className="h-5 w-5" /> Account</CardTitle></CardHeader><CardContent><Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto"><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button></CardContent></Card>
    </div>
  )
}
