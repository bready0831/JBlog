import { createClient } from 'npm:@supabase/supabase-js@2'

const NOTION_TOKEN      = Deno.env.get('NOTION_TOKEN')!
const NOTION_DB_ID      = Deno.env.get('NOTION_DATABASE_ID')!
const NOTION_VERSION    = '2022-06-28'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (_req) => {
  try {
    const pages = await fetchAllPages()

    const idToSlug = new Map<string, string>()
    for (const page of pages) {
      const slug = page.properties['Slug']?.rich_text?.[0]?.plain_text
      if (slug) idToSlug.set(page.id, slug)
    }

    // 기존 포스트의 notion_id → last_edited_at 맵 조회
    const { data: existing } = await supabase.from('posts').select('notion_id, notion_last_edited_at')
    const existingMap = new Map((existing ?? []).map((r: any) => [r.notion_id, r.notion_last_edited_at]))

    const added:     string[] = []
    const updated:   string[] = []
    const unchanged: number[] = []

    for (const page of pages) {
      const title        = page.properties['이름']?.title?.[0]?.plain_text ?? '(제목 없음)'
      const lastEdited   = page.last_edited_time as string
      const storedEdited = existingMap.get(page.id)

      if (!storedEdited) {
        // DB에 없음 → 신규
        await syncPage(page, idToSlug)
        added.push(title)
      } else if (storedEdited !== lastEdited) {
        // last_edited_time이 다름 → 실제 수정됨
        await syncPage(page, idToSlug)
        updated.push(title)
      } else {
        // 변경 없음 → 스킵
        unchanged.push(1)
      }
    }

    console.log(`[sync] 추가: ${added.length}개, 수정: ${updated.length}개, 변경없음: ${unchanged.length}개`)
    if (added.length)   console.log(`[추가] ${added.join(' / ')}`)
    if (updated.length) console.log(`[수정] ${updated.join(' / ')}`)

    return Response.json({ ok: true, added: added.length, updated: updated.length, unchanged: unchanged.length, addedTitles: added, updatedTitles: updated })
  } catch (err) {
    console.error(err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
})

// ── Notion API helpers ─────────────────────────────────────────────────────

function notionHeaders() {
  return {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

async function fetchAllPages() {
  const pages: any[] = []
  let cursor: string | undefined

  do {
    const body: any = { page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`Notion DB query failed: ${JSON.stringify(data)}`)

    pages.push(...data.results)
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return pages
}

async function fetchBlocks(blockId: string): Promise<any[]> {
  const blocks: any[] = []
  let cursor: string | undefined

  do {
    const params = new URLSearchParams({ page_size: '100' })
    if (cursor) params.set('start_cursor', cursor)

    const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?${params}`, {
      headers: notionHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`Notion blocks fetch failed: ${JSON.stringify(data)}`)

    blocks.push(...data.results)
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return blocks
}

// ── Block → Markdown 변환 ──────────────────────────────────────────────────

function richTextToMd(richText: any[]): string {
  return (richText ?? []).map((t: any) => {
    let text = t.plain_text
    if (t.annotations?.code)          text = `\`${text}\``
    if (t.annotations?.bold)          text = `**${text}**`
    if (t.annotations?.italic)        text = `*${text}*`
    if (t.annotations?.strikethrough) text = `~~${text}~~`
    if (t.href)                        text = `[${text}](${t.href})`
    return text
  }).join('')
}

async function blocksToMarkdown(blocks: any[], depth = 0): Promise<string> {
  const indent = '  '.repeat(depth)
  const lines: string[] = []

  for (const block of blocks) {
    const type = block.type
    const b    = block[type]

    switch (type) {
      case 'paragraph':
        lines.push(richTextToMd(b.rich_text) || '')
        break
      case 'heading_1':
        lines.push(`# ${richTextToMd(b.rich_text)}`)
        break
      case 'heading_2':
        lines.push(`## ${richTextToMd(b.rich_text)}`)
        break
      case 'heading_3':
        lines.push(`### ${richTextToMd(b.rich_text)}`)
        break
      case 'bulleted_list_item':
        lines.push(`${indent}- ${richTextToMd(b.rich_text)}`)
        break
      case 'numbered_list_item':
        lines.push(`${indent}1. ${richTextToMd(b.rich_text)}`)
        break
      case 'code':
        lines.push(`\`\`\`${b.language ?? ''}\n${richTextToMd(b.rich_text)}\n\`\`\``)
        break
      case 'quote':
        lines.push(`> ${richTextToMd(b.rich_text)}`)
        break
      case 'callout':
        lines.push(`> ${b.icon?.emoji ?? ''} ${richTextToMd(b.rich_text)}`)
        break
      case 'divider':
        lines.push('---')
        break
      case 'image': {
        const url = b.type === 'external' ? b.external.url : b.file?.url
        const caption = richTextToMd(b.caption)
        lines.push(`![${caption}](${url})`)
        break
      }
      case 'toggle':
        lines.push(`<details><summary>${richTextToMd(b.rich_text)}</summary>`)
        if (block.has_children) {
          const children = await fetchBlocks(block.id)
          lines.push(await blocksToMarkdown(children, depth + 1))
        }
        lines.push('</details>')
        break
      default:
        break
    }

    // 자식 블록이 있는 경우 (toggle 제외)
    if (block.has_children && type !== 'toggle') {
      const children = await fetchBlocks(block.id)
      lines.push(await blocksToMarkdown(children, depth + 1))
    }
  }

  return lines.join('\n\n')
}

// ── 페이지 동기화 ──────────────────────────────────────────────────────────

async function syncPage(page: any, idToSlug: Map<string, string>) {
  const props = page.properties

  const title         = props['이름']?.title?.[0]?.plain_text ?? ''
  const description   = props['Description']?.rich_text?.[0]?.plain_text ?? null
  const date          = props['Date']?.date?.start ?? null
  const status        = props['Status']?.status?.name ?? null
  const slug          = props['Slug']?.rich_text?.[0]?.plain_text ?? null
  const category      = props['Category']?.select?.name ?? null
  const tags          = props['Tag']?.multi_select?.map((t: any) => t.name) ?? []
  const relatedIds    = props['Related']?.relation?.map((r: any) => r.id) ?? []
  const related_slugs = relatedIds.map((id: string) => idToSlug.get(id)).filter(Boolean)

  const blocks  = await fetchBlocks(page.id)
  const content = await blocksToMarkdown(blocks)

  const { error } = await supabase.from('posts').upsert(
    { notion_id: page.id, title, description, content, date, status, slug, category, tags, related_slugs, notion_last_edited_at: page.last_edited_time },
    { onConflict: 'notion_id' }
  )
  if (error) throw error
}
