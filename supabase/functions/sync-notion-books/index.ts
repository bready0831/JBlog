import { supabase } from '../_shared/notion-sync.ts'
import { fetchAllBooks, syncBook } from '../_shared/notion-book-sync.ts'

Deno.serve(async (_req) => {
  try {
    const pages = await fetchAllBooks()

    const { data: existing } = await supabase
      .from('books')
      .select('notion_id, notion_last_edited_at')
    const existingMap = new Map(
      (existing ?? []).map((r: any) => [r.notion_id, r.notion_last_edited_at])
    )

    const added:     string[] = []
    const updated:   string[] = []
    const unchanged: string[] = []

    for (const page of pages) {
      const title        = page.properties['이름']?.title?.[0]?.plain_text ?? '(제목 없음)'
      const lastEdited   = page.last_edited_time as string
      const storedEdited = existingMap.get(page.id)

      if (!storedEdited) {
        await syncBook(page)
        added.push(title)
      } else if (storedEdited !== lastEdited) {
        await syncBook(page)
        updated.push(title)
      } else {
        unchanged.push(title)
      }
    }

    console.log(`[sync-books] 추가: ${added.length}개, 수정: ${updated.length}개, 변경없음: ${unchanged.length}개`)
    if (added.length)   console.log(`[추가] ${added.join(' / ')}`)
    if (updated.length) console.log(`[수정] ${updated.join(' / ')}`)

    return Response.json({ ok: true, added: added.length, updated: updated.length, unchanged: unchanged.length, addedTitles: added, updatedTitles: updated })
  } catch (err) {
    console.error(err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
})
