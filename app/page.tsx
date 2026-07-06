// app/page.tsx

import { supabase } from '@/lib/supabase'
import CollectionStage, { type StageItem } from './CollectionStage'

export const dynamic = 'force-dynamic'

type CollectionItem = {
  id: string
  image_url: string
  image_path: string
  source?: string | null
  description?: string | null
  created_at: string
  ai_response?: string | null
  keywords?: string[] | null
}

function parseAI(item: CollectionItem) {
  if (item.keywords && item.keywords.length > 0) {
    return {
      caption: item.description || 'Captured fragment',
      keywords: item.keywords.slice(0, 5),
    }
  }

  const raw = item.ai_response || ''

  try {
    const parsed = JSON.parse(raw)
    return {
      caption: parsed.description || item.description || 'Captured fragment',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
    }
  } catch {
    return {
      caption: item.description || item.ai_response || 'Captured fragment',
      keywords: [],
    }
  }
}

export default async function Home() {
  const { data: items, error } = await supabase
    .from('collection_items')
    .select('id, image_url, image_path, source, description, ai_response, keywords, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="archive-page">
        <h1>Supabase Error</h1>
        <pre>{error.message}</pre>
      </main>
    )
  }

  const collectionItems = (items || []) as CollectionItem[]
  const visibleItems = collectionItems.slice(0, 30)
  const stageItems: StageItem[] = visibleItems.map((item, index) => {
    const ai = parseAI(item)

    return {
      id: item.id,
      number: `COL / ${String(index + 1).padStart(4, '0')}`,
      imageUrl: item.image_url,
      source: item.source || 'spectacles',
      caption: ai.caption,
      keywords: ai.keywords.length > 0 ? ai.keywords : ['fragment'],
      createdAt: item.created_at,
    }
  })

  return <CollectionStage items={stageItems} totalCount={collectionItems.length} />
}
