import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()

    // Validar que el ID existe
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID del hito es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.date_taken !== undefined) updateData.date_taken = body.date_taken
    if (body.type !== undefined) updateData.type = body.type
    if (body.location !== undefined) updateData.location = body.location
    if (body.coordinates !== undefined) {
      updateData.coordinates = body.coordinates ? `(${body.coordinates.x},${body.coordinates.y})` : null
    }
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.is_favorite !== undefined) updateData.is_favorite = body.is_favorite

    const { data, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating milestone:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el hito', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Hito no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/milestones/[id]:', error)
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
    const supabase = getBrowserClient()

    // Validar que el ID existe
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID del hito es requerido' },
        { status: 400 }
      )
    }

    // Eliminar el hito
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting milestone:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el hito', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Hito eliminado correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/milestones/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
