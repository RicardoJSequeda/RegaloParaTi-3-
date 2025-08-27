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
        { error: 'ID del lugar es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.address !== undefined) updateData.address = body.address
    if (body.lat !== undefined) updateData.lat = body.lat
    if (body.lng !== undefined) updateData.lng = body.lng
    if (body.type !== undefined) updateData.type = body.type
    if (body.status !== undefined) updateData.status = body.status
    if (body.visit_date !== undefined) updateData.visit_date = body.visit_date
    if (body.description !== undefined) updateData.description = body.description
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.is_favorite !== undefined) updateData.is_favorite = body.is_favorite

    const { data, error } = await supabase
      .from('places')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating place:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el lugar', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Lugar no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/places/[id]:', error)
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
        { error: 'ID del lugar es requerido' },
        { status: 400 }
      )
    }

    // Eliminar el lugar
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting place:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el lugar', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Lugar eliminado correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/places/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
