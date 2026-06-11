// app/page.tsx

import { supabase } from '@/lib/supabase'

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

  return (
    <main className="archive-page">
      <div className="archive-grid-bg" />

      <header className="archive-header">
        <div>
          <p className="eyebrow">Participatory AR Archive</p>
          <h1>The Collection</h1>
          <p className="intro">
            Captured fragments drift through a living storage layer.
          </p>
        </div>

        <div className="archive-status">
          <span>{collectionItems.length}</span>
          <p>fragments</p>
        </div>
      </header>

      <section className="storage-map">
        <div className="map-line" />
        <p>CAPTURE</p>
        <p>COLLECT</p>
        <p>RE-PLACE</p>
      </section>

      <section className="fragment-field">
        {collectionItems.map((item, index) => {
          const ai = parseAI(item)

          return (
            <article
              key={item.id}
              className="archive-card"
              style={
                {
                  '--delay': `${(index % 12) * 0.22}s`,
                  '--depth': `${index % 5}`,
                } as React.CSSProperties
              }
            >
              <div className="image-frame">
                <img src={item.image_url} alt={ai.caption} />
              </div>

              <div className="card-info">
                <div className="card-topline">
                  <p>COL / {String(index + 1).padStart(4, '0')}</p>
                  <p>{item.source || 'spectacles'}</p>
                </div>

                <div className="keywords">
                  {ai.keywords.length > 0 ? (
                    ai.keywords.map((keyword: string) => (
                      <span key={keyword}>{keyword}</span>
                    ))
                  ) : (
                    <span>fragment</span>
                  )}
                </div>

                <p className="caption">{ai.caption}</p>

                <p className="date">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}