import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    const { data: gift, error } = await supabase
      .from('gifts')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating gift:', error)
      return NextResponse.json({ error: 'Error al actualizar regalo' }, { status: 500 })
    }

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Error in PATCH /api/gifts/[id]:', error)
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
      .from('gifts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting gift:', error)
      return NextResponse.json({ error: 'Error al eliminar regalo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/gifts/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
