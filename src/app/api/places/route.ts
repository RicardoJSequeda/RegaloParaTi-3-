import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching places:', error)
      return NextResponse.json(
        { error: 'Error al obtener los lugares', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/places:', error)
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
    if (!body.name) {
      return NextResponse.json(
        { error: 'Nombre del lugar es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para inserción
    const placeData = {
      name: body.name,
      address: body.address || null,
      lat: body.lat || null,
      lng: body.lng || null,
      type: body.type || 'otro',
      status: body.status || 'pendiente',
      visit_date: body.visit_date || null,
      description: body.description || null,
      image_url: body.image_url || null,
      tags: body.tags || [],
      is_favorite: body.is_favorite || false
    }

    const { data, error } = await supabase
      .from('places')
      .insert([placeData])
      .select()
      .single()

    if (error) {
      console.error('Error creating place:', error)
      return NextResponse.json(
        { error: 'Error al crear el lugar', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/places:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
