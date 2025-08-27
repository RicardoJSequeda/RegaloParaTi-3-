import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data, error } = await supabase
      .from('curiosities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching curiosities:', error)
      return NextResponse.json(
        { error: 'Error al obtener las curiosidades', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/curiosities:', error)
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
    if (!body.text) {
      return NextResponse.json(
        { error: 'Texto de la curiosidad es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para inserción
    const curiosityData = {
      text: body.text,
      category: body.category || null,
      is_active: body.is_active !== undefined ? body.is_active : true
    }

    const { data, error } = await supabase
      .from('curiosities')
      .insert([curiosityData])
      .select()
      .single()

    if (error) {
      console.error('Error creating curiosity:', error)
      return NextResponse.json(
        { error: 'Error al crear la curiosidad', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/curiosities:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
