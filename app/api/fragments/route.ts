import { NextResponse } from 'next/server'
import { randomInt } from 'node:crypto'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

// A random offset over the entire visible archive, rather than a recent-items pool.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const ids = body?.excludeIds ?? []
    const validId = /^(?:[0-9]{1,20}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    if (!Array.isArray(ids) || ids.length > 256 || ids.some(id => typeof id !== 'string' || !validId.test(id))) {
      return NextResponse.json({error:'Invalid fragment exclusion list'}, {status:400})
    }
    const excluded = [...new Set(ids)]
    const filter = '(' + excluded.join(',') + ')'
    const countQuery = supabase.from('collection_items').select('id', {count:'exact',head:true})
      .not('image_url','is',null).neq('image_url','')
    const {count,error:countError} = await (excluded.length ? countQuery.not('id','in',filter) : countQuery)
    if (countError || count === null) {
      return NextResponse.json({error:'Could not read the collection'}, {status:503})
    }
    if (!count) return NextResponse.json({item:null}, {headers:{'Cache-Control':'no-store'}})
    const offset = randomInt(count)
    const itemQuery = supabase.from('collection_items')
      .select('id,image_url,description,keywords,mission_text')
      .not('image_url','is',null).neq('image_url','').order('id',{ascending:true})
    const filtered = excluded.length ? itemQuery.not('id','in',filter) : itemQuery
    const {data,error} = await filtered.range(offset,offset).maybeSingle()
    if (error) return NextResponse.json({error:'Could not read the fragment'}, {status:503})
    if (!data) return NextResponse.json({error:'Collection changed. Please retry.'}, {status:409})
    return NextResponse.json({item:data}, {headers:{'Cache-Control':'no-store'}})
  } catch {
    return NextResponse.json({error:'Invalid request or collection unavailable'}, {status:400})
  }
}
