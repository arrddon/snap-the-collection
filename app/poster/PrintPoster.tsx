'use client'

import { useState } from 'react'

export default function PrintPoster() {
  const [status, setStatus] = useState('')
  async function print() {
    setStatus('Preparing images…')
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.poster-sheet img'))
    try {
      await Promise.all(images.map(image => image.decode()))
      await document.fonts.ready
      setStatus('')
      window.print()
    } catch {
      setStatus('An image could not load. Refresh before printing.')
    }
  }
  return <div className="poster-toolbar"><a href="/">← The Collection</a><span>A2 portrait · 420 × 594 mm</span><button onClick={print} disabled={status === 'Preparing images…'}>Print / Save PDF</button><span role="status">{status}</span></div>
}
