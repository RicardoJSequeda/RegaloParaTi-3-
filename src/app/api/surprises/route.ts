import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateDate, validateURL, sanitizeObject } from '@/lib/validation'
import { apiCache, createCacheKey } from '@/lib/api-cache'

export const GET = withErrorHandler(async () => {
  const supabase = getBrowserClient()
  
  // Intentar obtener del cache
  const cacheKey = createCacheKey('surprises', 'all')
  const cached = apiCache.get<any[]>(cacheKey)
  if (cached !== null) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  }
  
  const { data: surprises, error } = await supabase
    .from('surprises')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) {
    throw new AppError('No se pudieron obtener las sorpresas', 500, 'DATABASE_ERROR', error)
  }
  
  const surprisesData = surprises || []
  
  // Guardar en cache (5 minutos)
  apiCache.set(cacheKey, surprisesData, 5 * 60 * 1000)
  
  return NextResponse.json(surprisesData, {
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
  validateRequiredFields(body, ['title', 'content_type'])

  // Validar y sanitizar campos
  const titleValidation = validateString(body.title, 'Título', {
    required: true,
    minLength: 1,
    maxLength: 200
  })

  if (!titleValidation.isValid) {
    throw new AppError(titleValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
  }

  // Validar tipo de contenido
  const validContentTypes = ['text', 'image', 'video', 'invitation', 'event', 'mixed']
  if (!validContentTypes.includes(body.content_type)) {
    throw new AppError('Tipo de contenido inválido', 400, 'VALIDATION_ERROR')
  }

  // Validar tipo de desbloqueo
  const validUnlockTypes = ['key', 'date', 'sequential', 'free']
  if (body.unlock_type && !validUnlockTypes.includes(body.unlock_type)) {
    throw new AppError('Tipo de desbloqueo inválido', 400, 'VALIDATION_ERROR')
  }

  // Validar fechas si están presentes
  if (body.unlock_date) {
    const dateValidation = validateDate(body.unlock_date, 'Fecha de desbloqueo', {
      format: 'YYYY-MM-DD'
    })
    if (!dateValidation.isValid) {
      throw new AppError(dateValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  if (body.event_date) {
    const dateValidation = validateDate(body.event_date, 'Fecha del evento', {
      format: 'YYYY-MM-DD'
    })
    if (!dateValidation.isValid) {
      throw new AppError(dateValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Validar URLs si están presentes
  if (body.content_image_url) {
    const urlValidation = validateURL(body.content_image_url, 'URL de imagen')
    if (!urlValidation.isValid) {
      throw new AppError(urlValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  if (body.content_video_url) {
    const urlValidation = validateURL(body.content_video_url, 'URL de video')
    if (!urlValidation.isValid) {
      throw new AppError(urlValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Sanitizar datos
  const surpriseData = sanitizeObject({
    title: body.title.trim(),
    description: body.description?.trim() || '',
    cover_image: body.cover_image || null,
    category: body.category || 'mixto',
    is_unlocked: body.is_unlocked || false,
    unlock_type: body.unlock_type || 'free',
    unlock_date: body.unlock_date || null,
    unlock_time: body.unlock_time || null,
    required_key: body.required_key?.trim() || null,
    depends_on: body.depends_on || null,
    sequential_order: body.sequential_order || null,
    content_type: body.content_type,
    content_title: body.content_title?.trim() || null,
    content_description: body.content_description?.trim() || null,
    content_text: body.content_text?.trim() || null,
    content_image_url: body.content_image_url || null,
    content_video_url: body.content_video_url || null,
    event_date: body.event_date || null,
    event_location: body.event_location?.trim() || null,
    event_map_link: body.event_map_link || null,
    content_blocks: body.content_blocks || null,
    order: body.order || 0,
    effects: body.effects || {},
    preview_message: body.preview_message?.trim() || null,
    achievements: Array.isArray(body.achievements) ? body.achievements : [],
    created_by: body.created_by?.trim() || null
  })
  
  const { data: newSurprise, error } = await supabase
    .from('surprises')
    .insert(surpriseData)
    .select()
    .single()
  
  if (error) {
    throw new AppError('No se pudo crear la sorpresa', 500, 'DATABASE_ERROR', error)
  }

  // Limpiar cache
  apiCache.delete(createCacheKey('surprises', 'all'))
  
  return NextResponse.json(newSurprise, { status: 201 })
})
