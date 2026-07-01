import { fetchAllBooks, syncBook } from '../_shared/notion-book-sync.ts'

Deno.serve(async (_req) => {
  try {
    const pages = await fetchAllBooks()

    const synced: string[] = []
    const failed: string[] = []

    for (const page of pages) {
      const title = page.properties['이름']?.title?.[0]?.plain_text ?? '(제목 없음)'
      try {
        await syncBook(page)
        synced.push(title)
        console.log(`[force-sync-books] ✓ ${title}`)
      } catch (err) {
        failed.push(title)
        console.error(`[force-sync-books] ✗ ${title}:`, err)
      }
    }

    console.log(`[force-sync-books] 완료: ${synced.length}개, 실패: ${failed.length}개`)

    return Response.json({ ok: true, synced: synced.length, failed: failed.length, syncedTitles: synced, failedTitles: failed })
  } catch (err) {
    console.error(err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
})
