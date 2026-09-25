'use client'

import { useRef, useState } from 'react'

export type StageItem = {
  id: string; number: string; imageUrl: string; source: string; caption: string
  missionText?: string | null; keywords: string[]; createdAt: string
}

function FragmentImage({ item, eager = false }: { item: StageItem; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return failed ? <span className="image-unavailable">Image unavailable</span> : (
    // External collection storage serves original transparent PNGs.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.imageUrl} alt={item.caption} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />
  )
}

export default function CollectionStage({ items }: { items: StageItem[]; totalCount: number }) {
  const [selected, setSelected] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const active = items[selected]
  const related = active ? items.map((item, index) => ({ item, index })).filter(({ item }) => item.id !== active.id && item.keywords.some(keyword => active.keywords.some(other => other.toLowerCase() === keyword.toLowerCase()))).slice(0, 3) : []

  function open(index: number) {
    setSelected(index)
    dialog.current?.showModal()
  }

  return (
    <main className="collection-page">
      <header className="masthead">
        <h1 className="wordmark"><a href="#collection">THE COLLECTION</a></h1>
      </header>
      <section id="collection" className="archive" aria-label="Collected fragments">
        {items.length === 0 ? <div className="empty-state"><h3>A collection starts with a little noticing.</h3><p>Fragments collected with Spectacles will appear here.</p></div> : (
          <div className="fragment-grid">{items.map((item, index) => (
            <button className="fragment-card" type="button" key={item.id} onClick={() => open(index)} aria-label={`Explore fragment ${index + 1}: ${item.caption}`}>
              <div className="fragment-art"><span className="fragment-number">{String(index + 1).padStart(3, '0')}</span><FragmentImage item={item} eager={index < 4} /><svg className="open-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></div>
              <div className="fragment-caption"><span className="mission">{item.missionText || 'An everyday discovery'}</span><h3>{item.caption}</h3><div className="keywords">{item.keywords.slice(0, 3).map((keyword, i) => <span key={`${keyword}-${i}`}>{keyword}</span>)}</div></div>
            </button>
          ))}</div>
        )}
      </section>
      <footer><span>THE COLLECTION</span><p>Look closer. There’s more to connect.</p><span>Capture → Collect → Connect</span></footer>

      <dialog ref={dialog} className={`fragment-dialog${selected % 4 === 1 || selected % 4 === 2 ? ' is-blue' : ''}`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} onKeyDown={event => { if (event.key === 'ArrowRight') setSelected(index => (index + 1) % items.length); if (event.key === 'ArrowLeft') setSelected(index => (index - 1 + items.length) % items.length) }} aria-labelledby="fragment-title">
        {active && <><div className="dialog-top"><span>FRAGMENT / {String(selected + 1).padStart(3, '0')}</span><button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close fragment" autoFocus>Close ×</button></div>
          <div className="detail-layout"><div className="detail-art"><FragmentImage key={active.id} item={active} eager /></div><div className="detail-copy"><p className="eyebrow">Mission</p><p className="detail-mission">{active.missionText || 'Notice something around you.'}</p><p className="eyebrow">The discovery</p><h2 id="fragment-title">{active.caption}</h2><div className="keywords">{active.keywords.map((keyword, i) => <span key={`${keyword}-${i}`}>{keyword}</span>)}</div><p className="capture-date">Collected {new Date(active.createdAt).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          {related.length > 0 && <div className="related"><h3>Another way to see it</h3>{related.map(({ item, index }) => <button key={item.id} onClick={() => setSelected(index)}>{item.missionText || item.keywords[0]}<span aria-hidden="true">↗</span></button>)}</div>}</div></div>
          <div className="dialog-navigation"><button onClick={() => setSelected((selected - 1 + items.length) % items.length)}>← Previous</button><span>{selected + 1} / {items.length}</span><button onClick={() => setSelected((selected + 1) % items.length)}>Next →</button></div></>}
      </dialog>
    </main>
  )
}
