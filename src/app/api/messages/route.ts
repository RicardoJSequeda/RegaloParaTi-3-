import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function GET() {
	const supabase = getAdminClient()
	const { data, error } = await supabase
		.from('messages')
		.select('*')
		.order('date', { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data })
}

export async function POST(req: Request) {
	const supabase = getAdminClient()
	const body = await req.json()
	const payload = {
		title: body.title,
		content: body.content,
		date: body.date ?? new Date().toISOString().slice(0, 10),
		category: body.category ?? 'Amor',
		is_read: body.is_read ?? false,
		is_favorite: body.is_favorite ?? false
	}
	const { data, error } = await supabase.from('messages').insert(payload).select('*').single()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data }, { status: 201 })
}
