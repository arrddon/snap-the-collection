import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: items, error } = await supabase
    .from('collection_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <h1>Supabase Error</h1>
        <pre>{error.message}</pre>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold">The Collection</h1>

      <p className="mt-2 text-neutral-400">
        Captured fragments from Spectacles.
      </p>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items?.length === 0 && (
          <p className="text-neutral-500">No images yet.</p>
        )}

        {items?.map((item) => (
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
              <p className="text-sm text-neutral-500">
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