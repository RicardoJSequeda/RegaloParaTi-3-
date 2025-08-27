import { createBrowserClient } from '@supabase/ssr'

export const createSupabaseBrowserClient = () =>
	createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
	)

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function getBrowserClient() {
	if (!browserClient) {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL
		const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		
		if (!url || !key) {
			throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa .env.local y reinicia el server.')
		}
		
		browserClient = createSupabaseBrowserClient()
	}
	return browserClient
}
