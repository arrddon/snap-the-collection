import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageBase64, source } = body

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const bucket = process.env.SUPABASE_BUCKET || 'snap-collection-images'
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const filePath = `captures/${Date.now()}.jpg`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)
    const imageUrl = data.publicUrl

    const { error: insertError } = await supabaseAdmin
      .from('collection_items')
      .insert({
        image_url: imageUrl,
        image_path: filePath,
        source: source || 'spectacles',
        description: 'Captured from Spectacles',
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePath: filePath,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}