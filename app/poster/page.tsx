import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { fragmentColors } from '@/lib/fragmentColors'
import PrintPoster from './PrintPoster'
import './poster.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'The Collection — A2 Poster' }

export default async function Poster() {
  const { data, error } = await supabase.from('collection_items')
    .select('id,image_url,description,mission_text').order('created_at', { ascending: false }).limit(36)

  if (error || !data?.length) return <main className="archive-page"><h1>Poster unavailable</h1><p>The latest fragments could not be loaded. Please refresh before printing.</p><a href="/poster">Try again</a></main>

  const colors = fragmentColors(data.map(item => item.id))

  return <main className="poster-page">
    <PrintPoster />
    <article className="poster-sheet" aria-label="The Collection A2 portrait poster">
      <header className="poster-heading"><h1>THE COLLECTION</h1><p>A participatory AR experience for collecting overlooked fragments and building a shared spatial archive.</p></header>
      <section className="poster-fragments" aria-label="Latest collected fragments">
        {data.map((item, index) => <figure key={item.id} className="poster-fragment" style={{ backgroundColor: colors[index] }}>
          <span className="poster-number">{String(index + 1).padStart(3, '0')}</span>
          {/* Original images preserve the hand-traced fragment silhouettes. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt={item.description || item.mission_text || 'Collected fragment'} loading="eager" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>
        </figure>)}
      </section>

      <div className="poster-bottom">
        <div className="poster-credits"><p>Project by</p><p>Arrddon (Kiryung Nam)<br />Crystal Acqua<br />Liwen Zhang</p></div>
        <div className="poster-logos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="spectacles-logo" src="/poster/spectacles.png" alt="Spectacles by Snap Inc." />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rca-logo" src="/poster/royal-college-of-art.png" alt="Royal College of Art" />
        </div>
      </div>
    </article>
  </main>
}
