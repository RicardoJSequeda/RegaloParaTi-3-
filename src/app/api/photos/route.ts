import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching photos:', error)
      return NextResponse.json(
        { error: 'Error al obtener las fotos', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/photos:', error)
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
    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: 'Título e imagen son requeridos' },
        { status: 400 }
      )
    }

    // Preparar datos para inserción
    const photoData = {
      title: body.title,
      description: body.description || null,
      image_url: body.image_url,
      thumbnail_url: body.thumbnail_url || null,
      file_type: body.file_type || 'image',
      category: body.category || 'otro',
      tags: body.tags || [],
      location: body.location || null,
      date_taken: body.date_taken || null,
      favorite: body.favorite || false
    }

    const { data, error } = await supabase
      .from('photos')
      .insert([photoData])
      .select()
      .single()

    if (error) {
      console.error('Error creating photo:', error)
      return NextResponse.json(
        { error: 'Error al crear la foto', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/photos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
