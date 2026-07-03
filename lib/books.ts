import { supabase } from "@/lib/supabase"
import type { Book } from "@/lib/types"

const VISIBLE_STATUSES = ["읽는 중", "완료"] as const

function visibleBooks() {
  return supabase
    .from("books")
    .select("*")
    .in("status", VISIBLE_STATUSES)
    .order("date", { ascending: false })
}

export async function getRecentBooks(limit = 10): Promise<Book[]> {
  const { data } = await visibleBooks().limit(limit)
  return data ?? []
}

export async function getAllBooks(): Promise<Book[]> {
  const { data } = await visibleBooks()
  return data ?? []
}

export async function getBook(slug: string): Promise<Book | null> {
  const { data } = await visibleBooks()
    .or(`slug.eq.${slug},notion_id.eq.${slug}`)
    .single()
  return data
}
