import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateDate, sanitizeObject } from '@/lib/validation'
import { apiCache, createCacheKey } from '@/lib/api-cache'

export const GET = withErrorHandler(async () => {
  const supabase = getBrowserClient()
  
  // Intentar obtener del cache
  const cacheKey = createCacheKey('diary', 'all')
  const cached = apiCache.get<any[]>(cacheKey)
  if (cached !== null) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360'
      }
    })
  }
  
  const { data: entries, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new AppError('Error al obtener entradas del diario', 500, 'DATABASE_ERROR', error)
  }

  const entriesData = entries || []
  
  // Guardar en cache (3 minutos - más corto porque es contenido dinámico)
  apiCache.set(cacheKey, entriesData, 3 * 60 * 1000)

  return NextResponse.json(entriesData, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360'
    }
  })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = getBrowserClient()
  const body = await parseRequestBody(request)
  
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
    maxLength: 10000
  })

  if (!titleValidation.isValid || !contentValidation.isValid) {
    const errors = [...titleValidation.errors, ...contentValidation.errors]
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR', { errors })
  }

  // Validar fecha si está presente
  if (body.date) {
    const dateValidation = validateDate(body.date, 'Fecha', {
      format: 'YYYY-MM-DD'
    })
    if (!dateValidation.isValid) {
      throw new AppError(dateValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Sanitizar datos
  const sanitizedData = sanitizeObject({
    title: body.title.trim(),
    content: body.content.trim(),
    date: body.date || new Date().toISOString().split('T')[0],
    mood: body.mood || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    is_private: body.is_private ?? false
  })
  
  const { data: entry, error } = await supabase
    .from('diary_entries')
    .insert([sanitizedData])
    .select()
    .single()

  if (error) {
    throw new AppError('Error al crear entrada del diario', 500, 'DATABASE_ERROR', error)
  }

  // Limpiar cache
  apiCache.delete(createCacheKey('diary', 'all'))

  return NextResponse.json(entry, { status: 201 })
})
