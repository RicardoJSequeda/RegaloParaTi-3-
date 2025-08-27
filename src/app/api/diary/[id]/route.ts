import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    const { data: entry, error } = await supabase
      .from('diary_entries')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating diary entry:', error)
      return NextResponse.json({ error: 'Error al actualizar entrada del diario' }, { status: 500 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error in PATCH /api/diary/[id]:', error)
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
      .from('diary_entries')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting diary entry:', error)
      return NextResponse.json({ error: 'Error al eliminar entrada del diario' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/diary/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
