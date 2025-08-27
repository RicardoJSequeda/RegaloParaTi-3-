import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface ValidationError {
  field: string
  message: string
}

interface FormValidationProps {
  errors: ValidationError[]
  className?: string
}

export function FormValidation({ errors, className = '' }: FormValidationProps) {
  if (errors.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <div>
            <strong>{error.field}:</strong> {error.message}
          </div>
        </div>
      ))}
    </div>
  )
}

// Funciones de validación comunes
export const validators = {
  required: (value: any, fieldName: string): ValidationError | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return {
        field: fieldName,
        message: 'Este campo es obligatorio'
      }
    }
    return null
  },

  minLength: (value: string, fieldName: string, min: number): ValidationError | null => {
    if (value && value.length < min) {
      return {
        field: fieldName,
        message: `Debe tener al menos ${min} caracteres`
      }
    }
    return null
  },

  maxLength: (value: string, fieldName: string, max: number): ValidationError | null => {
    if (value && value.length > max) {
      return {
        field: fieldName,
        message: `Debe tener máximo ${max} caracteres`
      }
    }
    return null
  },

  email: (value: string, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return {
        field: fieldName,
        message: 'Debe ser un email válido'
      }
    }
    return null
  },

  number: (value: any, fieldName: string): ValidationError | null => {
    if (value && isNaN(Number(value))) {
      return {
        field: fieldName,
        message: 'Debe ser un número válido'
      }
    }
    return null
  },

  positiveNumber: (value: any, fieldName: string): ValidationError | null => {
    const num = Number(value)
    if (value && (isNaN(num) || num <= 0)) {
      return {
        field: fieldName,
        message: 'Debe ser un número positivo'
      }
    }
    return null
  },

  date: (value: string, fieldName: string): ValidationError | null => {
    if (value && isNaN(Date.parse(value))) {
      return {
        field: fieldName,
        message: 'Debe ser una fecha válida'
      }
    }
    return null
  },

  futureDate: (value: string, fieldName: string): ValidationError | null => {
    if (value) {
      const date = new Date(value)
      const now = new Date()
      if (date <= now) {
        return {
          field: fieldName,
          message: 'La fecha debe ser futura'
        }
      }
    }
    return null
  },

  pastDate: (value: string, fieldName: string): ValidationError | null => {
    if (value) {
      const date = new Date(value)
      const now = new Date()
      if (date >= now) {
        return {
          field: fieldName,
          message: 'La fecha debe ser pasada'
        }
      }
    }
    return null
  }
}

// Función para validar un formulario completo
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, Array<(value: any, fieldName: string) => ValidationError | null>>
): ValidationError[] {
  const errors: ValidationError[] = []

  Object.keys(rules).forEach(fieldName => {
    const fieldRules = rules[fieldName]
    const fieldValue = data[fieldName]

    fieldRules.forEach(rule => {
      const error = rule(fieldValue, fieldName)
      if (error) {
        errors.push(error)
      }
    })
  })

  return errors
}
