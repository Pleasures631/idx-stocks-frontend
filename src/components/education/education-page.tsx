"use client"

import Link from "next/link"
import { BookOpen, GraduationCap, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { educationService, type EducationArticle } from "@/services/education"
import { educationLevels } from "@/lib/education"

export function EducationPage() {
  const [articles, setArticles] = useState<EducationArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    educationService.list().then(setArticles).catch(() => setError("Materi edukasi belum tersedia.")).finally(() => setLoading(false))
  }, [])

  const titleOverrides = new Map(educationLevels.flatMap(level => level.lessons.map(lesson => [lesson.href.split("/").filter(Boolean).pop(), lesson.title] as const)))
  const levels = Array.from(new Map(articles.map(article => [article.level, article.level_title])).entries()).sort(([a], [b]) => a - b)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary"><GraduationCap className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edukasi Saham</h1>
          <p className="text-muted-foreground">Materi belajar yang tersedia langsung di dashboard.</p>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Memuat materi...</div>}
      {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
      {!loading && !error && levels.length === 0 && <p className="text-sm text-muted-foreground">Belum ada artikel yang diimpor.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {levels.map(([level, levelTitle]) => {
          const levelArticles = articles.filter(article => article.level === level)
          return (
            <Card key={level}>
              <CardHeader>
                <CardTitle className="text-lg">{levelTitle}</CardTitle>
                <CardDescription>{levelArticles.length} materi pembelajaran</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1">
                  {levelArticles.map(article => (
                    <li key={article.slug}>
                      <Link href={`/education/${article.slug}`} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <BookOpen className="h-4 w-4 shrink-0 text-primary/70" />
                        <span>{titleOverrides.get(article.slug) || article.title}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
