import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-3 text-center text-xs text-muted-foreground md:px-6">
      <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/privacy" className="hover:text-foreground hover:underline">Kebijakan Privasi</Link>
        <Link href="/terms" className="hover:text-foreground hover:underline">Syarat & Ketentuan</Link>
        <Link href="/disclaimer" className="hover:text-foreground hover:underline">Disclaimer Investasi</Link>
      </nav>
      <p className="mt-1">© {new Date().getFullYear()} Yapping Saham</p>
    </footer>
  )
}
