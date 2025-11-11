import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateDate, validateNumber, sanitizeObject } from '@/lib/validation'

export const GET = withErrorHandler(async () => {
  const supabase = getBrowserClient()
  
  const { data: gifts, error } = await supabase
    .from('gifts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new AppError('Error al obtener regalos', 500, 'DATABASE_ERROR', error)
  }

  return NextResponse.json(gifts || [])
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = getBrowserClient()
  const body = await parseRequestBody(request)
  
  // Validar campos requeridos
  validateRequiredFields(body, ['title'])

  // Validar y sanitizar campos
  const titleValidation = validateString(body.title, 'Título', {
    required: true,
    minLength: 1,
    maxLength: 200
  })

  if (!titleValidation.isValid) {
    throw new AppError(titleValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
  }

  // Validar fecha si está presente
  if (body.date_received) {
    const dateValidation = validateDate(body.date_received, 'Fecha de recepción', {
      format: 'YYYY-MM-DD'
    })
    if (!dateValidation.isValid) {
      throw new AppError(dateValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Validar precio si está presente
  if (body.price !== undefined && body.price !== null) {
    const priceValidation = validateNumber(body.price, 'Precio', {
      min: 0
    })
    if (!priceValidation.isValid) {
      throw new AppError(priceValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Sanitizar datos
  const sanitizedData = sanitizeObject({
    title: body.title.trim(),
    description: body.description?.trim() || null,
    giver: body.giver?.trim() || null,
    date_received: body.date_received || null,
    price: body.price || null,
    category: body.category || 'otro',
    tags: Array.isArray(body.tags) ? body.tags : [],
    image_url: body.image_url || null,
    is_favorite: body.is_favorite ?? false,
    notes: body.notes?.trim() || null
  })
  
  const { data: gift, error } = await supabase
    .from('gifts')
    .insert([sanitizedData])
    .select()
    .single()

  if (error) {
    throw new AppError('Error al crear regalo', 500, 'DATABASE_ERROR', error)
  }

  return NextResponse.json(gift, { status: 201 })
})
