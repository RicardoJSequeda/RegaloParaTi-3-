import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function POST(req: Request) {
	const supabase = getAdminClient()
	const { data: countData, error: countErr } = await supabase.from('messages').select('id', { count: 'exact', head: true })
	if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 })
	// @ts-ignore count available via countData?.count in supabase-js v2 head=true
	// If rows exist, skip
	// Fallback: try selecting one row
	const { data: existing } = await supabase.from('messages').select('id').limit(1)
	if (existing && existing.length > 0) return NextResponse.json({ skipped: true })

	const body = await req.json().catch(() => ({ items: [] as any[] }))
	const items = body.items ?? []
	if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'No items to seed' }, { status: 400 })
	const payload = items.map((m: any) => ({
		title: m.title,
		content: m.content,
		date: m.date,
		category: m.category,
		is_read: !!m.isRead,
		is_favorite: !!m.isFavorite
	}))
	const { error } = await supabase.from('messages').insert(payload)
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ ok: true })
}
