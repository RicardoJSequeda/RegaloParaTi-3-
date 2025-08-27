import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
	const supabase = getAdminClient()
	const body = await _req.json()
	const { data, error } = await supabase
		.from('messages')
		.update({ ...body, updated_at: new Date().toISOString() })
		.eq('id', params.id)
		.select('*')
		.single()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
	const supabase = getAdminClient()
	const { error } = await supabase.from('messages').delete().eq('id', params.id)
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ ok: true })
}
