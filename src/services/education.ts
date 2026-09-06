import apiClient from "@/lib/api-client"

export interface EducationArticle {
  id: number
  level: number
  level_title: string
  title: string
  slug: string
  source_url: string
  content_html: string
  sort_order: number
  fetched_at: string
}

export const educationService = {
  async list(): Promise<EducationArticle[]> {
    const response = await apiClient.get<{ success: boolean; data: EducationArticle[] }>("/education/articles", { skipLoading: true })
    return response.data.data
  },
  async get(slug: string): Promise<EducationArticle> {
    const response = await apiClient.get<{ success: boolean; data: EducationArticle }>(`/education/articles/${encodeURIComponent(slug)}`, { skipLoading: true })
    return response.data.data
  },
}
