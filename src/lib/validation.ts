/**
 * Utilidades de validación y sanitización de datos
 */

// Tipos para validación
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valida y sanitiza un string
 */
export function validateString(
  value: any,
  fieldName: string,
  options: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    trim?: boolean
  } = {}
): ValidationResult {
  const errors: string[] = []
  const {
    required = false,
    minLength,
    maxLength,
    pattern,
    trim = true
  } = options

  // Verificar si es requerido
  if (required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    errors.push(`${fieldName} es requerido`)
    return { isValid: false, errors }
  }

  // Si no es requerido y no hay valor, es válido
  if (!required && (!value || value === '')) {
    return { isValid: true, errors: [] }
  }

  // Verificar tipo
  if (typeof value !== 'string') {
    errors.push(`${fieldName} debe ser un texto`)
    return { isValid: false, errors }
  }

  // Trim si es necesario
  const sanitized = trim ? value.trim() : value

  // Verificar longitud mínima
  if (minLength && sanitized.length < minLength) {
    errors.push(`${fieldName} debe tener al menos ${minLength} caracteres`)
  }

  // Verificar longitud máxima
  if (maxLength && sanitized.length > maxLength) {
    errors.push(`${fieldName} no puede tener más de ${maxLength} caracteres`)
  }

  // Verificar patrón
  if (pattern && !pattern.test(sanitized)) {
    errors.push(`${fieldName} tiene un formato inválido`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida un email
 */
export function validateEmail(email: any, fieldName: string = 'Email'): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return validateString(email, fieldName, {
    required: true,
    pattern: emailPattern,
    maxLength: 255
  })
}

/**
 * Valida una URL
 */
export function validateURL(url: any, fieldName: string = 'URL'): ValidationResult {
  try {
    if (!url || typeof url !== 'string') {
      return { isValid: false, errors: [`${fieldName} debe ser una URL válida`] }
    }
    new URL(url)
    return { isValid: true, errors: [] }
  } catch {
    return { isValid: false, errors: [`${fieldName} debe ser una URL válida`] }
  }
}

/**
 * Valida una fecha
 */
export function validateDate(
  date: any,
  fieldName: string = 'Fecha',
  options: {
    required?: boolean
    minDate?: string
    maxDate?: string
    format?: 'YYYY-MM-DD' | 'ISO'
  } = {}
): ValidationResult {
  const errors: string[] = []
  const { required = false, minDate, maxDate, format = 'YYYY-MM-DD' } = options

  if (required && !date) {
    errors.push(`${fieldName} es requerida`)
    return { isValid: false, errors }
  }

  if (!required && !date) {
    return { isValid: true, errors: [] }
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    errors.push(`${fieldName} tiene un formato inválido`)
    return { isValid: false, errors }
  }

  // Validar formato YYYY-MM-DD
  if (format === 'YYYY-MM-DD') {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(date)) {
      errors.push(`${fieldName} debe tener el formato YYYY-MM-DD`)
    }
  }

  // Validar fecha mínima
  if (minDate) {
    const minDateObj = new Date(minDate)
    if (dateObj < minDateObj) {
      errors.push(`${fieldName} no puede ser anterior a ${minDate}`)
    }
  }

  // Validar fecha máxima
  if (maxDate) {
    const maxDateObj = new Date(maxDate)
    if (dateObj > maxDateObj) {
      errors.push(`${fieldName} no puede ser posterior a ${maxDate}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida un número
 */
export function validateNumber(
  value: any,
  fieldName: string,
  options: {
    required?: boolean
    min?: number
    max?: number
    integer?: boolean
  } = {}
): ValidationResult {
  const errors: string[] = []
  const { required = false, min, max, integer = false } = options

  if (required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} es requerido`)
    return { isValid: false, errors }
  }

  if (!required && (value === undefined || value === null || value === '')) {
    return { isValid: true, errors: [] }
  }

  const num = Number(value)
  if (isNaN(num)) {
    errors.push(`${fieldName} debe ser un número`)
    return { isValid: false, errors }
  }

  if (integer && !Number.isInteger(num)) {
    errors.push(`${fieldName} debe ser un número entero`)
  }

  if (min !== undefined && num < min) {
    errors.push(`${fieldName} debe ser mayor o igual a ${min}`)
  }

  if (max !== undefined && num > max) {
    errors.push(`${fieldName} debe ser menor o igual a ${max}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida un array
 */
export function validateArray(
  value: any,
  fieldName: string,
  options: {
    required?: boolean
    minLength?: number
    maxLength?: number
    itemValidator?: (item: any) => ValidationResult
  } = {}
): ValidationResult {
  const errors: string[] = []
  const { required = false, minLength, maxLength, itemValidator } = options

  if (required && (!value || !Array.isArray(value) || value.length === 0)) {
    errors.push(`${fieldName} es requerido y debe contener al menos un elemento`)
    return { isValid: false, errors }
  }

  if (!required && (!value || !Array.isArray(value) || value.length === 0)) {
    return { isValid: true, errors: [] }
  }

  if (!Array.isArray(value)) {
    errors.push(`${fieldName} debe ser un array`)
    return { isValid: false, errors }
  }

  if (minLength && value.length < minLength) {
    errors.push(`${fieldName} debe tener al menos ${minLength} elementos`)
  }

  if (maxLength && value.length > maxLength) {
    errors.push(`${fieldName} no puede tener más de ${maxLength} elementos`)
  }

  // Validar cada item si hay validador
  if (itemValidator) {
    value.forEach((item, index) => {
      const itemResult = itemValidator(item)
      if (!itemResult.isValid) {
        errors.push(`${fieldName}[${index}]: ${itemResult.errors.join(', ')}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover tags HTML básicos
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
}

/**
 * Sanitiza un objeto removiendo campos undefined y null innecesarios
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const sanitized: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]) as T[Extract<keyof T, string>]
      } else {
        sanitized[key] = obj[key]
      }
    }
  }
  return sanitized
}

/**
 * Valida múltiples campos y retorna todos los errores
 */
export function validateFields(
  validations: Array<ValidationResult>
): { isValid: boolean; errors: string[] } {
  const allErrors: string[] = []
  let isValid = true

  for (const validation of validations) {
    if (!validation.isValid) {
      isValid = false
      allErrors.push(...validation.errors)
    }
  }

  return { isValid, errors: allErrors }
}

