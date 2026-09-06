"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { educationService, type EducationArticle } from "@/services/education"
import { Button } from "@/components/ui/button"
import { educationLevels } from "@/lib/education"

export function EducationArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<EducationArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    educationService.get(slug).then(setArticle).catch(() => setError("Artikel tidak ditemukan.")).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Memuat artikel...</div>
  if (error || !article) return <div className="space-y-4"><p className="text-sm text-destructive">{error}</p><Button asChild variant="outline"><Link href="/education">Kembali ke edukasi</Link></Button></div>

  const titleOverride = educationLevels.flatMap(level => level.lessons).find(lesson => lesson.href.split("/").filter(Boolean).pop() === article.slug)?.title

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" className="-ml-3"><Link href="/education"><ArrowLeft className="mr-2 h-4 w-4" />Semua materi</Link></Button>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">{article.level_title}</p>
        <h1 className="text-3xl font-bold tracking-tight">{titleOverride || article.title}</h1>
        <p className="text-sm text-muted-foreground">Materi diimpor ke dashboard dari sumber resmi.</p>
      </header>
      <div className="rounded-lg border bg-card p-5 text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:my-3 [&_p]:my-3 [&_ul]:my-3" dangerouslySetInnerHTML={{ __html: article.content_html }} />
      <a href={article.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-muted-foreground underline hover:text-foreground">Lihat sumber asli <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>
    </article>
  )
}
