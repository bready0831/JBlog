import { supabase } from "@/lib/supabase"
import type { Post } from "@/lib/types"

export const PUBLISHED_STATUSES = ["완료", "메인"] as const

function publishedPosts() {
  return supabase
    .from("posts")
    .select("*")
    .in("status", PUBLISHED_STATUSES)
    .order("date", { ascending: false })
}

export async function getRecentPosts(limit = 5): Promise<Post[]> {
  const { data } = await publishedPosts().limit(limit)
  return data ?? []
}

export async function getAllPosts(): Promise<Post[]> {
  const { data } = await publishedPosts()
  return data ?? []
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data } = await publishedPosts()
    .or(`slug.eq.${slug},notion_id.eq.${slug}`)
    .single()
  return data
}

export async function getPostsBySlugs(slugs: string[]): Promise<Post[]> {
  if (slugs.length === 0) return []
  const { data } = await publishedPosts().in("slug", slugs)
  return data ?? []
}
