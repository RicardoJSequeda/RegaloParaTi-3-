import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    // Preparar datos para actualización
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image
    if (body.category !== undefined) updateData.category = body.category
    if (body.is_unlocked !== undefined) updateData.is_unlocked = body.is_unlocked
    if (body.unlock_type !== undefined) updateData.unlock_type = body.unlock_type
    if (body.unlock_date !== undefined) updateData.unlock_date = body.unlock_date
    if (body.unlock_time !== undefined) updateData.unlock_time = body.unlock_time
    if (body.required_key !== undefined) updateData.required_key = body.required_key
    if (body.depends_on !== undefined) updateData.depends_on = body.depends_on
    if (body.sequential_order !== undefined) updateData.sequential_order = body.sequential_order
    if (body.content_type !== undefined) updateData.content_type = body.content_type
    if (body.content_title !== undefined) updateData.content_title = body.content_title
    if (body.content_description !== undefined) updateData.content_description = body.content_description
    if (body.content_text !== undefined) updateData.content_text = body.content_text
    if (body.content_image_url !== undefined) updateData.content_image_url = body.content_image_url
    if (body.content_video_url !== undefined) updateData.content_video_url = body.content_video_url
    if (body.event_date !== undefined) updateData.event_date = body.event_date
    if (body.event_location !== undefined) updateData.event_location = body.event_location
    if (body.event_map_link !== undefined) updateData.event_map_link = body.event_map_link
    if (body.content_blocks !== undefined) updateData.content_blocks = body.content_blocks
    if (body.order !== undefined) updateData.order = body.order
    if (body.effects !== undefined) updateData.effects = body.effects
    if (body.preview_message !== undefined) updateData.preview_message = body.preview_message
    if (body.achievements !== undefined) updateData.achievements = body.achievements
    
    // Si se está desbloqueando, agregar timestamp
    if (body.is_unlocked && !body.unlocked_at) {
      updateData.unlocked_at = new Date().toISOString()
    }
    
    const { data: updatedSurprise, error } = await supabase
      .from('surprises')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating surprise:', error)
      return NextResponse.json(
        { error: 'No se pudo actualizar la sorpresa' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(updatedSurprise)
  } catch (error) {
    console.error('Error in PATCH /api/surprises/[id]:', error)
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
    
    // Obtener la sorpresa para verificar si tiene imagen de portada
    const { data: surprise, error: fetchError } = await supabase
      .from('surprises')
      .select('cover_image, content_image_url')
      .eq('id', params.id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching surprise for deletion:', fetchError)
      return NextResponse.json(
        { error: 'No se pudo encontrar la sorpresa' },
        { status: 404 }
      )
    }
    
    // Eliminar la sorpresa
    const { error: deleteError } = await supabase
      .from('surprises')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      console.error('Error deleting surprise:', deleteError)
      return NextResponse.json(
        { error: 'No se pudo eliminar la sorpresa' },
        { status: 500 }
      )
    }
    
    // Si tenía imágenes, eliminarlas de storage (opcional)
    if (surprise.cover_image || surprise.content_image_url) {
      try {
        const imagesToDelete = []
        if (surprise.cover_image) imagesToDelete.push(surprise.cover_image)
        if (surprise.content_image_url) imagesToDelete.push(surprise.content_image_url)
        
        // Eliminar imágenes de Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('surprises')
          .remove(imagesToDelete)
        
        if (storageError) {
          console.error('Error deleting images from storage:', storageError)
        }
      } catch (storageError) {
        console.error('Error handling image deletion:', storageError)
      }
    }
    
    return NextResponse.json({ message: 'Sorpresa eliminada exitosamente' })
  } catch (error) {
    console.error('Error in DELETE /api/surprises/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
