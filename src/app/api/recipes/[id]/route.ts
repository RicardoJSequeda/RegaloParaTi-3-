import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    const { data: recipe, error } = await supabase
      .from('recipes')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recipe:', error)
      return NextResponse.json({ 
        error: 'Error al actualizar receta', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error in PATCH /api/recipes/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getBrowserClient()
    
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting recipe:', error)
      return NextResponse.json({ error: 'Error al eliminar receta' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/recipes/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
