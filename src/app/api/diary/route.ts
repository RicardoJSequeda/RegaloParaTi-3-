import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data: entries, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching diary entries:', error)
      return NextResponse.json({ error: 'Error al obtener entradas del diario' }, { status: 500 })
    }

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error in GET /api/diary:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    const { data: entry, error } = await supabase
      .from('diary_entries')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating diary entry:', error)
      return NextResponse.json({ error: 'Error al crear entrada del diario' }, { status: 500 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error in POST /api/diary:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
