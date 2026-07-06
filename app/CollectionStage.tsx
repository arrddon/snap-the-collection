'use client'

import { useEffect, useMemo, useState } from 'react'

export type StageItem = {
  id: string
  number: string
  imageUrl: string
  source: string
  caption: string
  keywords: string[]
  createdAt: string
}

type CardMotion = {
  tint: string
}

const motions: CardMotion[] = [
  { tint: 'blue' },
  { tint: 'coral' },
  { tint: 'green' },
  { tint: 'pink' },
  { tint: 'cyan' },
  { tint: 'violet' },
]

function getTiltedCircleLayout(index: number, total: number) {
  const safeTotal = Math.max(total, 1)
  const angle = (index / safeTotal) * Math.PI * 2 - Math.PI / 2
  const radius = 34
  const screenX = Math.cos(angle) * radius
  const screenY = Math.sin(angle) * radius + 13
  const front = (Math.sin(angle) + 1) / 2
  const tilt = Math.cos(angle) * 9

  return {
    x: `${screenX.toFixed(2)}vmin`,
    y: `calc(${screenY.toFixed(2)}vmin + 1vh)`,
    tilt: `${tilt.toFixed(2)}deg`,
    alpha: `${(0.62 + front * 0.38).toFixed(2)}`,
    scale: `${(0.82 + front * 0.2).toFixed(2)}`,
    zIndex: `${Math.round(1000 + front * 900 + index)}`,
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function CardContent({ item, isFocused = false }: { item: StageItem; isFocused?: boolean }) {
  return (
    <>
      <div className="collection-image">
        <img src={item.imageUrl} alt={item.caption} />
      </div>

      <div className="collection-card-info">
        <div className="collection-card-topline">
          <p>{item.number}</p>
          <p>{item.source}</p>
        </div>

        <div className="collection-keywords">
          {item.keywords.slice(0, isFocused ? 8 : 5).map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>

        <p className="collection-caption">{item.caption}</p>
        <p className="collection-date">{formatDate(item.createdAt)}</p>
      </div>
    </>
  )
}

export default function CollectionStage({
  items,
  totalCount,
}: {
  items: StageItem[]
  totalCount: number
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className={`collection-page${selectedItem ? ' has-focus' : ''}`}>
      <header className="collection-header">
        <div>
          <p className="collection-kicker">shared archive of attention</p>
          <h1>The Collection</h1>
        </div>

        <div className="collection-count">
          <span>{totalCount}</span>
          <p>fragments</p>
        </div>
      </header>

      <section className="collection-stage" aria-label="Collection fragments">
        {items.length === 0 ? (
          <div className="empty-collection">
            <p>No fragments yet</p>
          </div>
        ) : (
          items.map((item, index) => {
            const motion = motions[index % motions.length]
            const layout = getTiltedCircleLayout(index, items.length)

            return (
              <button
                key={item.id}
                className={`collection-card collection-card-${motion.tint}`}
                style={
                  {
                    '--x': layout.x,
                    '--y': layout.y,
                    '--tilt': layout.tilt,
                    '--alpha': layout.alpha,
                    '--scale': layout.scale,
                    zIndex: layout.zIndex,
                  } as React.CSSProperties
                }
                type="button"
                onClick={() => setSelectedId(item.id)}
                onPointerDown={() => setSelectedId(item.id)}
                aria-label={`Open ${item.number}`}
              >
                <CardContent item={item} />
              </button>
            )
          })
        )}
      </section>

      {selectedItem ? (
        <div
          className="focus-layer"
          role="presentation"
          onClick={() => setSelectedId(null)}
        >
          <article
            className="focus-card"
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.caption}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="focus-close"
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close fragment"
            >
              ×
            </button>
            <CardContent item={selectedItem} isFocused />
          </article>
        </div>
      ) : null}
    </main>
  )
}
