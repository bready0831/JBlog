import { supabase } from "@/lib/supabase"
import type { Post } from "@/lib/types"

export const PUBLISHED_STATUSES = ["완료", "메인"] as const

export async function getRecentPosts(limit = 5): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .in("status", PUBLISHED_STATUSES)
    .order("date", { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getAllPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .in("status", PUBLISHED_STATUSES)
    .order("date", { ascending: false })
  return data ?? []
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .or(`slug.eq.${slug},notion_id.eq.${slug}`)
    .in("status", PUBLISHED_STATUSES)
    .single()
  return data
}
