import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateDate, sanitizeObject } from '@/lib/validation'

export const GET = withErrorHandler(async () => {
  const supabase = getBrowserClient()
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    throw new AppError('Error al obtener los planes', 500, 'DATABASE_ERROR', error)
  }

  return NextResponse.json(data || [])
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = getBrowserClient()
  const body = await parseRequestBody(request)

  // Validar campos requeridos
  validateRequiredFields(body, ['title', 'description', 'date'])

  // Validar y sanitizar campos
  const titleValidation = validateString(body.title, 'Título', {
    required: true,
    minLength: 1,
    maxLength: 200
  })

  const descValidation = validateString(body.description, 'Descripción', {
    required: true,
    minLength: 1,
    maxLength: 2000
  })

  const dateValidation = validateDate(body.date, 'Fecha', {
    required: true,
    format: 'YYYY-MM-DD'
  })

  if (!titleValidation.isValid || !descValidation.isValid || !dateValidation.isValid) {
    const errors = [
      ...titleValidation.errors,
      ...descValidation.errors,
      ...dateValidation.errors
    ]
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR', { errors })
  }

  // Validar prioridad
  const validPriorities = ['Alta', 'Media', 'Baja']
  if (body.priority && !validPriorities.includes(body.priority)) {
    throw new AppError('Prioridad inválida', 400, 'VALIDATION_ERROR')
  }

  // Validar estado
  const validStatuses = ['pendiente', 'en_progreso', 'completado', 'cancelado']
  if (body.status && !validStatuses.includes(body.status)) {
    throw new AppError('Estado inválido', 400, 'VALIDATION_ERROR')
  }

  // Sanitizar datos
  const planData = sanitizeObject({
    title: body.title.trim(),
    description: body.description.trim(),
    date: body.date,
    time: body.time?.trim() || null,
    location: body.location?.trim() || null,
    category: body.category || 'otro',
    priority: body.priority || 'Media',
    status: body.status || 'pendiente',
    notes: body.notes?.trim() || null,
    participants: Array.isArray(body.participants) ? body.participants : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    reminder: body.reminder || { enabled: false, time: '1h', type: 'notification' },
    image: body.image || null
  })

  const { data, error } = await supabase
    .from('plans')
    .insert([planData])
    .select()
    .single()

  if (error) {
    throw new AppError('Error al crear el plan', 500, 'DATABASE_ERROR', error)
  }

  return NextResponse.json(data, { status: 201 })
})
