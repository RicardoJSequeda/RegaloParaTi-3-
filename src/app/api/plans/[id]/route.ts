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
        { error: 'ID del plan es requerido' },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.date !== undefined) updateData.date = body.date
    if (body.time !== undefined) updateData.time = body.time
    if (body.location !== undefined) updateData.location = body.location
    if (body.category !== undefined) updateData.category = body.category
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.participants !== undefined) updateData.participants = body.participants
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.reminder !== undefined) updateData.reminder = body.reminder
    if (body.image !== undefined) updateData.image = body.image

    const { data, error } = await supabase
      .from('plans')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating plan:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el plan', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/plans/[id]:', error)
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
        { error: 'ID del plan es requerido' },
        { status: 400 }
      )
    }

    // Primero obtener el plan para verificar que existe
    const { data: existingPlan, error: fetchError } = await supabase
      .from('plans')
      .select('image')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el plan
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting plan:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el plan', details: error.message },
        { status: 500 }
      )
    }

    // Si el plan tenía imagen, eliminar del storage
    if (existingPlan.image && existingPlan.image.includes('plan-images')) {
      try {
        const imagePath = existingPlan.image.split('/').pop()
        if (imagePath) {
          await supabase.storage
            .from('plan-images')
            .remove([imagePath])
        }
      } catch (storageError) {
        console.warn('Error deleting plan image from storage:', storageError)
      }
    }

    return NextResponse.json({ message: 'Plan eliminado correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/plans/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
