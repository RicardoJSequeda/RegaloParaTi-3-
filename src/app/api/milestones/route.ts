import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateDate, validateURL, sanitizeObject } from '@/lib/validation'
import { apiCache, createCacheKey } from '@/lib/api-cache'

export const GET = withErrorHandler(async () => {
  const supabase = getBrowserClient()
  
  // Intentar obtener del cache
  const cacheKey = createCacheKey('milestones', 'all')
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
    .from('milestones')
    .select('*')
    .order('date_taken', { ascending: false })

  if (error) {
    throw new AppError('Error al obtener los hitos', 500, 'DATABASE_ERROR', error)
  }

  const milestones = data || []
  
  // Guardar en cache (5 minutos)
  apiCache.set(cacheKey, milestones, 5 * 60 * 1000)

  return NextResponse.json(milestones, {
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
  validateRequiredFields(body, ['title', 'date_taken'])

  // Validar y sanitizar campos
  const titleValidation = validateString(body.title, 'Título', {
    required: true,
    minLength: 1,
    maxLength: 200
  })

  const dateValidation = validateDate(body.date_taken, 'Fecha', {
    required: true,
    format: 'YYYY-MM-DD'
  })

  if (!titleValidation.isValid || !dateValidation.isValid) {
    const errors = [...titleValidation.errors, ...dateValidation.errors]
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR', { errors })
  }

  // Validar tipo
  const validTypes = ['aniversario', 'viajes', 'eventos', 'otros']
  if (body.type && !validTypes.includes(body.type)) {
    throw new AppError('Tipo inválido', 400, 'VALIDATION_ERROR')
  }

  // Validar URL de imagen si está presente
  if (body.image_url) {
    const urlValidation = validateURL(body.image_url, 'URL de imagen')
    if (!urlValidation.isValid) {
      throw new AppError(urlValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Validar coordenadas si están presentes
  if (body.coordinates) {
    if (typeof body.coordinates !== 'object' || 
        typeof body.coordinates.x !== 'number' || 
        typeof body.coordinates.y !== 'number') {
      throw new AppError('Coordenadas inválidas', 400, 'VALIDATION_ERROR')
    }
  }

  // Sanitizar datos
  const milestoneData = sanitizeObject({
    title: body.title.trim(),
    description: body.description?.trim() || null,
    image_url: body.image_url || null,
    date_taken: body.date_taken,
    type: body.type || 'eventos',
    location: body.location?.trim() || null,
    coordinates: body.coordinates ? `(${body.coordinates.x},${body.coordinates.y})` : null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    is_favorite: body.is_favorite || false
  })

  const { data, error } = await supabase
    .from('milestones')
    .insert([milestoneData])
    .select()
    .single()

  if (error) {
    throw new AppError('Error al crear el hito', 500, 'DATABASE_ERROR', error)
  }

  // Limpiar cache
  apiCache.delete(createCacheKey('milestones', 'all'))

  return NextResponse.json(data, { status: 201 })
})
