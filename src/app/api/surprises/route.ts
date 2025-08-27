import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data: surprises, error } = await supabase
      .from('surprises')
      .select('*')
      .order('order', { ascending: true })
    
    if (error) {
      console.error('Error fetching surprises:', error)
      return NextResponse.json(
        { error: 'No se pudieron obtener las sorpresas' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(surprises)
  } catch (error) {
    console.error('Error in GET /api/surprises:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.title || !body.content_type) {
      return NextResponse.json(
        { error: 'Título y tipo de contenido son requeridos' },
        { status: 400 }
      )
    }
    
    // Preparar datos para inserción
    const surpriseData = {
      title: body.title,
      description: body.description || '',
      cover_image: body.cover_image,
      category: body.category || 'mixto',
      is_unlocked: body.is_unlocked || false,
      unlock_type: body.unlock_type || 'free',
      unlock_date: body.unlock_date,
      unlock_time: body.unlock_time,
      required_key: body.required_key,
      depends_on: body.depends_on,
      sequential_order: body.sequential_order,
      content_type: body.content_type,
      content_title: body.content_title,
      content_description: body.content_description,
      content_text: body.content_text,
      content_image_url: body.content_image_url,
      content_video_url: body.content_video_url,
      event_date: body.event_date,
      event_location: body.event_location,
      event_map_link: body.event_map_link,
      content_blocks: body.content_blocks,
      order: body.order || 0,
      effects: body.effects || {},
      preview_message: body.preview_message,
      achievements: body.achievements || [],
      created_by: body.created_by
    }
    
    const { data: newSurprise, error } = await supabase
      .from('surprises')
      .insert(surpriseData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating surprise:', error)
      return NextResponse.json(
        { error: 'No se pudo crear la sorpresa' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(newSurprise, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/surprises:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
