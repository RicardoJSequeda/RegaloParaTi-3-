import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gifts:', error)
      return NextResponse.json({ error: 'Error al obtener regalos' }, { status: 500 })
    }

    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Error in GET /api/gifts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    const { data: gift, error } = await supabase
      .from('gifts')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating gift:', error)
      return NextResponse.json({ error: 'Error al crear regalo' }, { status: 500 })
    }

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Error in POST /api/gifts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
