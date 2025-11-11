import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { withErrorHandler, parseRequestBody, validateRequiredFields, AppError } from '@/lib/api-error-handler'
import { validateString, validateNumber, sanitizeObject } from '@/lib/validation'

export const GET = withErrorHandler(async () => {
  const supabase = getBrowserClient()
  
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new AppError('Error al obtener recetas', 500, 'DATABASE_ERROR', error)
  }

  return NextResponse.json(recipes || [])
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

  // Validar descripción si está presente
  if (body.description) {
    const descValidation = validateString(body.description, 'Descripción', {
      maxLength: 5000
    })
    if (!descValidation.isValid) {
      throw new AppError(descValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Validar ingredientes si está presente
  if (body.ingredients && !Array.isArray(body.ingredients)) {
    throw new AppError('Los ingredientes deben ser un array', 400, 'VALIDATION_ERROR')
  }

  // Validar tiempo de preparación si está presente
  if (body.prep_time !== undefined && body.prep_time !== null) {
    const timeValidation = validateNumber(body.prep_time, 'Tiempo de preparación', {
      min: 0
    })
    if (!timeValidation.isValid) {
      throw new AppError(timeValidation.errors.join(', '), 400, 'VALIDATION_ERROR')
    }
  }

  // Sanitizar datos
  const sanitizedData = sanitizeObject({
    title: body.title.trim(),
    description: body.description?.trim() || null,
    ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
    instructions: body.instructions?.trim() || null,
    prep_time: body.prep_time || null,
    cook_time: body.cook_time || null,
    servings: body.servings || null,
    difficulty: body.difficulty || 'media',
    category: body.category || 'otro',
    tags: Array.isArray(body.tags) ? body.tags : [],
    image_url: body.image_url || null,
    source: body.source?.trim() || null,
    notes: body.notes?.trim() || null,
    is_favorite: body.is_favorite ?? false
  })
  
  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert([sanitizedData])
    .select()
    .single()

  if (error) {
    throw new AppError('Error al crear receta', 500, 'DATABASE_ERROR', error)
  }

  return NextResponse.json(recipe, { status: 201 })
})
