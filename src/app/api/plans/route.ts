import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching plans:', error)
      return NextResponse.json(
        { error: 'Error al obtener los planes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/plans:', error)
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
    if (!body.title || !body.description || !body.date) {
      return NextResponse.json(
        { error: 'Título, descripción y fecha son requeridos' },
        { status: 400 }
      )
    }

    // Preparar datos para inserción
    const planData = {
      title: body.title,
      description: body.description,
      date: body.date,
      time: body.time || null,
      location: body.location || null,
      category: body.category || 'otro',
      priority: body.priority || 'Media',
      status: body.status || 'pendiente',
      notes: body.notes || null,
      participants: body.participants || [],
      tags: body.tags || [],
      reminder: body.reminder || { enabled: false, time: '1h', type: 'notification' },
      image: body.image || null
    }

    const { data, error } = await supabase
      .from('plans')
      .insert([planData])
      .select()
      .single()

    if (error) {
      console.error('Error creating plan:', error)
      return NextResponse.json(
        { error: 'Error al crear el plan', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/plans:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
