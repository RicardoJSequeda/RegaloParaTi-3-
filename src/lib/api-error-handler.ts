/**
 * Manejo centralizado de errores para API routes
 */

import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: any
}

export class AppError extends Error {
  statusCode: number
  code?: string
  details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Maneja errores de API y retorna respuesta apropiada
 */
export function handleApiError(error: unknown): NextResponse {
  // Error conocido de la aplicación
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { details: error.details })
      },
      { status: error.statusCode }
    )
  }

  // Error de Supabase
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string; details?: string }
    return NextResponse.json(
      {
        error: 'Error en la base de datos',
        message: supabaseError.message,
        code: supabaseError.code || 'DATABASE_ERROR',
        ...(process.env.NODE_ENV === 'development' && { details: supabaseError.details })
      },
      { status: 500 }
    )
  }

  // Error desconocido
  const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
  return NextResponse.json(
    {
      error: errorMessage,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.stack : String(error)
      })
    },
    { status: 500 }
  )
}

/**
 * Wrapper para manejar errores en API routes
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now()
    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime
      
      // Log de la request (solo en desarrollo o para debugging)
      if (process.env.NODE_ENV === 'development') {
        const { logger } = await import('./logger')
        const statusCode = response.status
        logger.api('API', args[0]?.url || 'unknown', statusCode, duration)
      }
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      const { logger } = await import('./logger')
      logger.error('API Error', error instanceof Error ? error : new Error(String(error)), {
        duration,
        args: args.map(arg => arg?.url || 'unknown')
      })
      return handleApiError(error)
    }
  }
}

/**
 * Valida que el body de la request sea JSON válido
 */
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    const body = await request.json()
    return body
  } catch (error) {
    throw new AppError('Body inválido o malformado', 400, 'INVALID_BODY')
  }
}

/**
 * Valida que los campos requeridos estén presentes
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): void {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missingFields.push(field)
    }
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Campos requeridos faltantes: ${missingFields.join(', ')}`,
      400,
      'MISSING_REQUIRED_FIELDS',
      { missingFields }
    )
  }
}

