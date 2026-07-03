import { supabase, uploadImage, fetchAllPages, blocksToMarkdown, fetchBlocks } from './notion-sync.ts'

const NOTION_BOOK_DB_ID = Deno.env.get('NOTION_BOOK_DATABASE_ID')!

export async function fetchAllBooks() {
  return fetchAllPages(NOTION_BOOK_DB_ID)
}

async function extractCoverUrl(page: any): Promise<string | null> {
  const cover = page.cover
  if (!cover) return null
  return cover.type === 'external' ? cover.external?.url : cover.file?.url ?? null
}

export async function syncBook(page: any) {
  const props = page.properties

  const title       = props['이름']?.title?.[0]?.plain_text ?? ''
  const slug        = props['Slug']?.rich_text?.[0]?.plain_text ?? null
  const status      = props['Status']?.status?.name ?? null
  const category    = props['Category']?.select?.name ?? null
  const tags        = props['Tag']?.multi_select?.map((t: any) => t.name) ?? []
  const date           = props['Date']?.date?.start ?? null
  const relatedPostIds = (props['post']?.relation ?? []).map((r: any) => r.id)

  const coverUrl      = await extractCoverUrl(page)
  const thumbnail_url = coverUrl ? await uploadImage(coverUrl, `book-cover-${page.id}`) : null

  const blocks  = await fetchBlocks(page.id)
  const content = await blocksToMarkdown(blocks)

  let related_post_slugs: string[] = []
  if (relatedPostIds.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select('slug, notion_id')
      .in('notion_id', relatedPostIds)
    related_post_slugs = (data ?? []).map((p: any) => p.slug).filter(Boolean)
  }

  const { error } = await supabase.from('books').upsert(
    {
      notion_id: page.id,
      title,
      slug,
      status,
      category,
      tags,
      date,
      thumbnail_url,
      content: content || null,
      related_post_slugs,
      notion_last_edited_at: page.last_edited_time,
    },
    { onConflict: 'notion_id' }
  )
  if (error) throw error
}
