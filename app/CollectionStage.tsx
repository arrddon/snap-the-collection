'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type StageItem = {
  id: string
  number: string
  imageUrl: string
  source: string
  caption: string
  keywords: string[]
  createdAt: string
}

type Point = { x: number; y: number }

const palette = ['ivory', 'aqua', 'peach', 'sage', 'lilac']

function positionFor(index: number): Point {
  const columns = 3
  const row = Math.floor(index / columns)
  const column = index % columns
  return {
    x: (column - 1) * 570 + (row % 2 ? 130 : 0),
    y: (row - 1) * 470 + [30, -55, 40][column],
  }
}

export default function CollectionStage({ items }: { items: StageItem[]; totalCount: number }) {
  const [focusedId, setFocusedId] = useState<string | null>(items[0]?.id ?? null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isTravelling, setIsTravelling] = useState(false)
  const travelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const positions = useMemo(() => items.map((_, index) => positionFor(index)), [items])
  const focusedIndex = Math.max(0, items.findIndex((item) => item.id === focusedId))
  const focus = positions[focusedIndex] ?? { x: 0, y: 0 }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => () => {
    if (travelTimer.current) clearTimeout(travelTimer.current)
  }, [])

  function focusCard(id: string) {
    if (id === focusedId) return
    if (travelTimer.current) clearTimeout(travelTimer.current)
    setIsTravelling(true)
    setFocusedId(id)
    travelTimer.current = setTimeout(() => setIsTravelling(false), 1400)
  }

  return (
    <main className="collection-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="project-intro">
        <p className="project-label">AR archive / Art school</p>
        <h1>The Collection</h1>
        <p className="project-description">
          Using AR to collate the creative fragments, stories, and unexpected connections, developed within an art school.
        </p>
      </header>
      <section className="collection-viewport" aria-label="The Collection">
        <div
          className={`collection-world${isTravelling ? ' is-travelling' : ''}`}
          style={{
            '--camera-x': `${focusedId ? -focus.x : 0}px`,
            '--camera-y': `${focusedId ? -focus.y : 0}px`,
          } as React.CSSProperties}
        >
          <svg className="connections" width="2100" height="1800" viewBox="-1050 -900 2100 1800" aria-hidden="true">
            {positions.slice(0, -1).map((point, index) => {
              const next = positions[index + 1]
              const bend = (point.x + next.x) / 2
              return (
                <path
                  key={`${point.x}-${point.y}`}
                  d={`M ${point.x} ${point.y} C ${bend} ${point.y}, ${bend} ${next.y}, ${next.x} ${next.y}`}
                />
              )
            })}
          </svg>

          {items.map((item, index) => {
            const point = positions[index]
            const focused = focusedId === item.id
            return (
              <article
                key={item.id}
                className={`fragment fragment-${palette[index % palette.length]}${focused ? ' is-focused' : ''}`}
                style={{ '--card-x': `${point.x}px`, '--card-y': `${point.y}px` } as React.CSSProperties}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="keyword-rail keyword-left" aria-label="Keywords">
                  {item.keywords.filter((_, keywordIndex) => keywordIndex % 2 === 0).map((keyword) => (
                    <span key={`${keyword}-left`}><i />{keyword}</span>
                  ))}
                </div>

                <button
                  className="image-card"
                  type="button"
                  onClick={() => focusCard(item.id)}
                  aria-label={`Focus ${item.caption}`}
                >
                  <div className="image-frame">
                    {/* URLs come from the collection's external storage provider. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading={focused ? 'eager' : 'lazy'}
                      fetchPriority={focused ? 'high' : 'low'}
                    />
                  </div>
                  <h2>{item.caption}</h2>
                </button>

                <div className="keyword-rail keyword-right" aria-label="Keywords">
                  {item.keywords.filter((_, keywordIndex) => keywordIndex % 2 === 1).map((keyword) => (
                    <span key={`${keyword}-right`}><i />{keyword}</span>
                  ))}
                </div>
                <span className={`focus-dot${hoveredId === item.id ? ' is-active' : ''}`} aria-hidden="true" />
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
