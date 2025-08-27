import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function PATCH(request: NextRequest, { params }: { params: { id: string }}) {
  const supabase = getBrowserClient()
  const updates = await request.json()
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string }}) {
  const supabase = getBrowserClient()
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}


