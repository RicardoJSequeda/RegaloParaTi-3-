import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateURL, validateDate, sanitizeObject } from '@/lib/validation'
import { apiCache, createCacheKey } from '@/lib/api-cache'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const supabase = getBrowserClient()
  
  // Intentar obtener del cache
  const cacheKey = createCacheKey('photos', 'all')
  const cached = apiCache.get<any[]>(cacheKey)
  if (cached !== null) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  }
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new AppError('Error al obtener las fotos', 500, 'DATABASE_ERROR', error)
  }

  const photos = data || []
  
  // Guardar en cache (5 minutos)
  apiCache.set(cacheKey, photos, 5 * 60 * 1000)

  return NextResponse.json(photos, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = getBrowserClient()
  const body = await parseRequestBody(request)

  // Validar campos requeridos
  validateRequiredFields(body, ['title', 'image_url'])

  // Validar y sanitizar campos
  const titleValidation = validateString(body.title, 'Título', {
    required: true,
    minLength: 1,
    maxLength: 200
  })

  const urlValidation = validateURL(body.image_url, 'URL de imagen')

  if (!titleValidation.isValid || !urlValidation.isValid) {
    const errors = [...titleValidation.errors, ...urlValidation.errors]
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR', { errors })
  }

  // Validar fecha si está presente
  if (body.date_taken) {
    const dateValidation = validateDate(body.date_taken, 'Fecha de captura', {
      format: 'YYYY-MM-DD'
    })
    if (!dateValidation.isValid) {
      throw new AppError(dateValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Validar tipo de archivo
  const validFileTypes = ['image', 'video', 'gif']
  if (body.file_type && !validFileTypes.includes(body.file_type)) {
    throw new AppError('Tipo de archivo inválido', 400, 'VALIDATION_ERROR')
  }

  // Validar categoría
  const validCategories = ['romantico', 'familia', 'amigos', 'viajes', 'eventos', 'mascotas', 'comida', 'naturaleza', 'arte', 'otro']
  if (body.category && !validCategories.includes(body.category)) {
    throw new AppError('Categoría inválida', 400, 'VALIDATION_ERROR')
  }

  // Sanitizar datos
  const photoData = sanitizeObject({
    title: body.title.trim(),
    description: body.description?.trim() || null,
    image_url: body.image_url,
    thumbnail_url: body.thumbnail_url || null,
    file_type: body.file_type || 'image',
    category: body.category || 'otro',
    tags: Array.isArray(body.tags) ? body.tags : [],
    location: body.location?.trim() || null,
    date_taken: body.date_taken || null,
    favorite: body.favorite ?? false
  })

  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()
    .single()

  if (error) {
    throw new AppError('Error al crear la foto', 500, 'DATABASE_ERROR', error)
  }

  // Limpiar cache de fotos
  apiCache.delete(createCacheKey('photos', 'all'))

  return NextResponse.json(data, { status: 201 })
})
