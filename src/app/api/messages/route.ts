import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateDate, sanitizeObject } from '@/lib/validation'
import { apiCache, createCacheKey } from '@/lib/api-cache'

export const GET = withErrorHandler(async () => {
	const supabase = getAdminClient()
	
	// Intentar obtener del cache
	const cacheKey = createCacheKey('messages', 'all')
	const cached = apiCache.get<any[]>(cacheKey)
	if (cached !== null) {
		return NextResponse.json({ data: cached }, {
			headers: {
				'X-Cache': 'HIT',
				'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
			}
		})
	}
	
	const { data, error } = await supabase
		.from('messages')
		.select('*')
		.order('date', { ascending: false })
	
	if (error) {
		throw new AppError('Error al obtener mensajes', 500, 'DATABASE_ERROR', error)
	}
	
	const messagesData = data || []
	
	// Guardar en cache (5 minutos)
	apiCache.set(cacheKey, messagesData, 5 * 60 * 1000)
	
	return NextResponse.json({ data: messagesData }, {
		headers: {
			'X-Cache': 'MISS',
			'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
		}
	})
})

export const POST = withErrorHandler(async (req: Request) => {
	const supabase = getAdminClient()
	const body = await parseRequestBody(req)
	
	// Validar campos requeridos
	validateRequiredFields(body, ['title', 'content'])

	// Validar y sanitizar campos
	const titleValidation = validateString(body.title, 'Título', {
		required: true,
		minLength: 1,
		maxLength: 200
	})

	const contentValidation = validateString(body.content, 'Contenido', {
		required: true,
		minLength: 1,
		maxLength: 5000
	})

	if (!titleValidation.isValid || !contentValidation.isValid) {
		const errors = [...titleValidation.errors, ...contentValidation.errors]
		throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR', { errors })
	}

	// Validar fecha si está presente
	let date = body.date ?? new Date().toISOString().slice(0, 10)
	if (body.date) {
		const dateValidation = validateDate(body.date, 'Fecha', {
			format: 'YYYY-MM-DD'
		})
		if (!dateValidation.isValid) {
			throw new AppError(dateValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
		}
	}

	// Validar categoría
	const categoryValidation = validateString(body.category || 'Amor', 'Categoría', {
		maxLength: 50
	})
	if (!categoryValidation.isValid) {
		throw new AppError(categoryValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
	}

	// Sanitizar y preparar payload
	const payload = sanitizeObject({
		title: body.title.trim(),
		content: body.content.trim(),
		date: date,
		category: (body.category || 'Amor').trim(),
		is_read: body.is_read ?? false,
		is_favorite: body.is_favorite ?? false
	})

	const { data, error } = await supabase
		.from('messages')
		.insert(payload)
		.select('*')
		.single()
	
	if (error) {
		throw new AppError('Error al crear mensaje', 500, 'DATABASE_ERROR', error)
	}

	// Limpiar cache
	apiCache.delete(createCacheKey('messages', 'all'))
	
	return NextResponse.json({ data }, { status: 201 })
})
