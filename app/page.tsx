//app/page.tsx

import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type CollectionItem = {
  id: string
  image_url: string
  image_path: string
  source?: string | null
  description?: string | null
  created_at: string
}

export default async function Home() {
  const { data: items, error } = await supabase
    .from('collection_items')
    .select('id, image_url, image_path, source, description, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold">Supabase Error</h1>
        <pre className="mt-4 whitespace-pre-wrap text-red-400">
          {error.message}
        </pre>
      </main>
    )
  }

  const collectionItems = (items || []) as CollectionItem[]

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header>
        <h1 className="text-4xl font-bold">The Collection</h1>
        <p className="mt-2 text-neutral-400">
          Captured fragments from Spectacles.
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          {collectionItems.length} item(s) in the collection
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {collectionItems.length === 0 && (
          <p className="text-neutral-500">No images yet.</p>
        )}

        {collectionItems.map((item) => (
          <article
            key={item.id}
            className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900"
          >
            <img
              src={item.image_url}
              alt={item.description || 'Captured image'}
              className="w-full aspect-square object-cover"
            />

            <div className="p-4">
              <p className="text-xs text-neutral-500 break-all">
                {item.image_path}
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                {new Date(item.created_at).toLocaleString()}
              </p>

              <p className="mt-2">
                {item.description || 'Captured from Spectacles'}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}