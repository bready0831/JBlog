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

// ── 이미지 Storage 업로드 ─────────────────────────────────────────────────

async function uploadImage(notionUrl: string, blockId: string): Promise<string> {
  try {
    const res = await fetch(notionUrl)
    if (!res.ok) return notionUrl

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.split('/')[1]?.split(';')[0] ?? 'jpg'
    const path = `notion/${blockId}.${ext}`

    const buffer = await res.arrayBuffer()
    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, buffer, { contentType, upsert: true })

    if (error) return notionUrl

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return notionUrl
  }
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

const LANG_MAP: Record<string, string> = {
  'plain text': 'text',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'python': 'python',
  'bash': 'bash',
  'shell': 'bash',
  'sql': 'sql',
  'json': 'json',
  'html': 'html',
  'css': 'css',
  'yaml': 'yaml',
  'markdown': 'markdown',
  'rust': 'rust',
  'go': 'go',
  'java': 'java',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'c': 'c',
  'c++': 'cpp',
  'c#': 'csharp',
}

function normalizeLang(lang: string): string {
  return LANG_MAP[lang?.toLowerCase()] ?? lang ?? ''
}

async function blocksToMarkdown(blocks: any[], depth = 0): Promise<string> {
  const indent = '  '.repeat(depth)
  const segments: string[] = []
  let listBuffer: string[] = []
  let listType: 'bullet' | 'number' | null = null

  function flushList() {
    if (listBuffer.length === 0) return
    segments.push(listBuffer.join('\n'))
    listBuffer = []
    listType = null
  }

  for (const block of blocks) {
    const type = block.type
    const b    = block[type]

    if (type === 'bulleted_list_item') {
      if (listType === 'number') flushList()
      listType = 'bullet'
      listBuffer.push(`${indent}- ${richTextToMd(b.rich_text)}`)
      if (block.has_children) {
        const children = await fetchBlocks(block.id)
        listBuffer.push(await blocksToMarkdown(children, depth + 1))
      }
      continue
    }

    if (type === 'numbered_list_item') {
      if (listType === 'bullet') flushList()
      listType = 'number'
      listBuffer.push(`${indent}${listBuffer.length + 1}. ${richTextToMd(b.rich_text)}`)
      if (block.has_children) {
        const children = await fetchBlocks(block.id)
        listBuffer.push(await blocksToMarkdown(children, depth + 1))
      }
      continue
    }

    flushList()

    switch (type) {
      case 'paragraph':
        segments.push(richTextToMd(b.rich_text) || '')
        break
      case 'heading_1':
        segments.push(`# ${richTextToMd(b.rich_text)}`)
        break
      case 'heading_2':
        segments.push(`## ${richTextToMd(b.rich_text)}`)
        break
      case 'heading_3':
        segments.push(`### ${richTextToMd(b.rich_text)}`)
        break
      case 'code': {
        const lang = normalizeLang(b.language)
        segments.push(`\`\`\`${lang}\n${richTextToMd(b.rich_text)}\n\`\`\``)
        break
      }
      case 'quote':
        segments.push(`> ${richTextToMd(b.rich_text)}`)
        break
      case 'callout':
        segments.push(`> ${b.icon?.emoji ?? ''} ${richTextToMd(b.rich_text)}`)
        break
      case 'divider':
        segments.push('---')
        break
      case 'image': {
        const notionUrl = b.type === 'external' ? b.external.url : b.file?.url
        const caption = richTextToMd(b.caption)
        const storedUrl = await uploadImage(notionUrl, block.id)
        segments.push(`![${caption}](${storedUrl})`)
        break
      }
      case 'toggle':
        segments.push(`<details><summary>${richTextToMd(b.rich_text)}</summary>`)
        if (block.has_children) {
          const children = await fetchBlocks(block.id)
          segments.push(await blocksToMarkdown(children, depth + 1))
        }
        segments.push('</details>')
        break
      default:
        break
    }

    if (block.has_children && !['toggle', 'bulleted_list_item', 'numbered_list_item'].includes(type)) {
      const children = await fetchBlocks(block.id)
      segments.push(await blocksToMarkdown(children, depth + 1))
    }
  }

  flushList()
  return segments.join('\n\n')
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
