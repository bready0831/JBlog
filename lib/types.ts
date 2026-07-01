export interface Post {
  id: string
  notion_id: string
  title: string
  description: string | null
  content: string | null
  date: string | null
  status: '시작 전' | '진행 중' | '완료' | '메인' | null
  slug: string | null
  category: string | null
  tags: string[]
  related_slugs: string[]
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}
