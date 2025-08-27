import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function GET() {
	const supabase = getAdminClient()
	const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data })
}

export async function POST(req: Request) {
	const supabase = getAdminClient()
	const body = await req.json()
	const { data, error } = await supabase.from('songs').insert(body).select('*').single()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ data }, { status: 201 })
}
