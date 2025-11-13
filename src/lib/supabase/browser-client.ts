import { createBrowserClient } from '@supabase/ssr'

export const createSupabaseBrowserClient = () => {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
	
	if (!url || !key) {
		const errorMsg = 'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa .env.local y reinicia el servidor.'
		console.error('❌ Error de configuración Supabase:', errorMsg)
		throw new Error(errorMsg)
	}
	
	// Validar formato de URL
	if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
		const errorMsg = `URL de Supabase inválida: ${url}. Debe ser una URL válida de Supabase (https://*.supabase.co)`
		console.error('❌ Error de configuración Supabase:', errorMsg)
		throw new Error(errorMsg)
	}
	
	try {
		return createBrowserClient(url, key)
	} catch (error) {
		console.error('❌ Error al crear cliente de Supabase:', error)
		throw new Error(`Error al inicializar Supabase: ${error instanceof Error ? error.message : 'Error desconocido'}`)
	}
}

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function getBrowserClient() {
	if (!browserClient) {
		browserClient = createSupabaseBrowserClient()
	}
	return browserClient
}
