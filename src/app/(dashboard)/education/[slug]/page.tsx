import { EducationArticlePage } from "@/components/education/education-article-page"

export default function EducationArticleRoute({ params }: { params: { slug: string } }) {
  return <EducationArticlePage slug={params.slug} />
}
