import { getServerClient } from '@/lib/supabase/server-client'

export function table<T extends object>(name: string) {
	const supabase = getServerClient()
	return {
		select: (cols: string = '*') => supabase.from(name).select(cols),
		insert: (rows: T | T[]) => supabase.from(name).insert(rows).select('*'),
		update: (values: Partial<T>) => supabase.from(name).update(values),
		remove: () => supabase.from(name).delete()
	}
}
