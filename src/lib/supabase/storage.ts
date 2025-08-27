import { getBrowserClient } from '@/lib/supabase/browser-client'

export const BUCKET_AUDIO = 'audio'
export const BUCKET_COVERS = 'covers'

export async function uploadPublicFile(bucket: string, file: File, pathPrefix: string = '') {
	const supabase = getBrowserClient()
	const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase()
	const key = `${pathPrefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
	const { error } = await supabase.storage.from(bucket).upload(key, file, {
		cacheControl: '3600',
		upsert: false,
		contentType: file.type
	})
	if (error) throw error
	const { data } = supabase.storage.from(bucket).getPublicUrl(key)
	return { path: key, url: data.publicUrl }
}
