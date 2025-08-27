import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('date_taken', { ascending: false })

    if (error) {
      console.error('Error fetching milestones:', error)
      return NextResponse.json(
        { error: 'Error al obtener los hitos', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/milestones:', error)
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
    if (!body.title || !body.date_taken) {
      return NextResponse.json(
        { error: 'Título y fecha son requeridos' },
        { status: 400 }
      )
    }

    // Preparar datos para inserción
    const milestoneData = {
      title: body.title,
      description: body.description || null,
      image_url: body.image_url || null,
      date_taken: body.date_taken,
      type: body.type || 'eventos',
      location: body.location || null,
      coordinates: body.coordinates ? `(${body.coordinates.x},${body.coordinates.y})` : null,
      tags: body.tags || [],
      is_favorite: body.is_favorite || false
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert([milestoneData])
      .select()
      .single()

    if (error) {
      console.error('Error creating milestone:', error)
      return NextResponse.json(
        { error: 'Error al crear el hito', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/milestones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
