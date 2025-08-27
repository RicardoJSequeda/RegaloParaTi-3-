import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'
import { MovieForm } from '@/features/movies/types'

export async function GET() {
  try {
    const supabase = getAdminClient()
    
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching movies:', error)
      return NextResponse.json(
        { error: 'Error al obtener las películas', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(movies)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MovieForm = await request.json()
    const supabase = getAdminClient()

    // Validar campos requeridos
    if (!body.title || !body.description || !body.type || !body.genre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, description, type, genre' },
        { status: 400 }
      )
    }

    const { data: movie, error } = await supabase
      .from('movies')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating movie:', error)
      return NextResponse.json(
        { error: 'Error al crear la película', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
