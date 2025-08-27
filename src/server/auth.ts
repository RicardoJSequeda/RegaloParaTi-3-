import { getServerClient } from '@/lib/supabase/server-client'

export async function getSession() {
	const supabase = getServerClient()
	const { data } = await supabase.auth.getSession()
	return data.session ?? null
}

export async function getUser() {
	const supabase = getServerClient()
	const { data } = await supabase.auth.getUser()
	return data.user ?? null
}
