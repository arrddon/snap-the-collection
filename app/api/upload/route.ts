// app/api/upload/route.ts

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      imageBase64,
      source,
      description,
      keywords,
      aiResponse,
      missionText,
    } = body

    if (typeof imageBase64 !== 'string' || !imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    if (missionText != null && typeof missionText !== 'string') {
      return NextResponse.json({ error: 'missionText must be a string' }, { status: 400 })
    }
    const mission = typeof missionText === 'string' ? missionText.replace(/\s+/g, ' ').trim() : ''
    if (mission.length > 500) {
      return NextResponse.json({ error: 'missionText must be at most 500 characters' }, { status: 400 })
    }

    const bucket = process.env.SUPABASE_BUCKET || 'snap-collection-images'
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    // Detect bytes rather than trusting the client's MIME declaration.
    const isPng = imageBuffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    const isJpeg = imageBuffer[0] === 255 && imageBuffer[1] === 216 && imageBuffer[2] === 255
    if (!isPng && !isJpeg) {
      return NextResponse.json({ error: 'Only PNG and JPEG images are supported' }, { status: 400 })
    }
    const contentType = isPng ? 'image/png' : 'image/jpeg'
    const filePath = `captures/${crypto.randomUUID()}.${isPng ? 'png' : 'jpg'}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, imageBuffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)
    const imageUrl = data.publicUrl

    const cleanKeywords = Array.isArray(keywords) ? keywords.slice(0, 6) : []

    const { error: insertError } = await supabaseAdmin
      .from('collection_items')
      .insert({
        image_url: imageUrl,
        image_path: filePath,
        source: source || 'spectacles',
        description: description || 'Captured from Spectacles',
        ai_response: aiResponse || null,
        keywords: cleanKeywords,
        ...(mission ? { mission_text: mission } : {}),
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePath: filePath,
      description: description || 'Captured from Spectacles',
      keywords: cleanKeywords,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
