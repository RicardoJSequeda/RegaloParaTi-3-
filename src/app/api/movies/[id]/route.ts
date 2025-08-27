import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'
import { MovieForm } from '@/features/movies/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<MovieForm> = await request.json()
    const supabase = getAdminClient()

    const { data: movie, error } = await supabase
      .from('movies')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating movie:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la película', details: error.message },
        { status: 500 }
      )
    }

    if (!movie) {
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting movie:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la película', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
