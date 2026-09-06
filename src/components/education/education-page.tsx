import { BookOpen, ExternalLink, GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { educationLevels } from "@/lib/education"

export function EducationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edukasi Saham</h1>
            <p className="text-muted-foreground">Belajar saham secara bertahap dari mindset sampai teknikal dasar.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {educationLevels.map((level, index) => (
          <Card key={level.title} className={index === 0 ? "border-primary/40" : undefined}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-3 text-lg">
                <span>{level.title}</span>
                <a href={level.href} target="_blank" rel="noreferrer" aria-label={`Open ${level.title}`}>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground" />
                </a>
              </CardTitle>
              <CardDescription>{level.lessons.length} materi pembelajaran</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1">
                {level.lessons.map((lesson) => (
                  <li key={lesson.href}>
                    <a
                      href={lesson.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-primary/70" />
                      <span>{lesson.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
