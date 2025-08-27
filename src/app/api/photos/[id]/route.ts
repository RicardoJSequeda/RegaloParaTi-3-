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
        { error: 'ID de la foto es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url
    if (body.file_type !== undefined) updateData.file_type = body.file_type
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.location !== undefined) updateData.location = body.location
    if (body.date_taken !== undefined) updateData.date_taken = body.date_taken
    if (body.favorite !== undefined) updateData.favorite = body.favorite

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating photo:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la foto', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/photos/[id]:', error)
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
        { error: 'ID de la foto es requerido' },
        { status: 400 }
      )
    }

    // Primero obtener la foto para verificar que existe
    const { data: existingPhoto, error: fetchError } = await supabase
      .from('photos')
      .select('image_url')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingPhoto) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la foto
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting photo:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la foto', details: error.message },
        { status: 500 }
      )
    }

    // Si la foto tenía imagen en storage, eliminar del storage
    if (existingPhoto.image_url && existingPhoto.image_url.includes('photos')) {
      try {
        const imagePath = existingPhoto.image_url.split('/').pop()
        if (imagePath) {
          await supabase.storage
            .from('photos')
            .remove([imagePath])
        }
      } catch (storageError) {
        console.warn('Error deleting photo from storage:', storageError)
      }
    }

    return NextResponse.json({ message: 'Foto eliminada correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/photos/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
