'use client'

import { useState, useCallback, useRef } from 'react'
import { validateString, validateDate, validateNumber, validateEmail, validateURL, ValidationResult } from '@/lib/validation'

type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  type?: 'string' | 'number' | 'date' | 'email' | 'url'
  custom?: (value: any) => ValidationResult
}

type ValidationRules = Record<string, ValidationRule>

interface UseFormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules
  onSubmit: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    validationRules = {},
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true
  } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = validationRules[name]
    if (!rule) return null

    let result: ValidationResult

    if (rule.custom) {
      result = rule.custom(value)
    } else {
      switch (rule.type) {
        case 'email':
          result = validateEmail(value, name)
          break
        case 'url':
          result = validateURL(value, name)
          break
        case 'date':
          result = validateDate(value, name, {
            required: rule.required,
            format: 'YYYY-MM-DD'
          })
          break
        case 'number':
          result = validateNumber(value, name, {
            required: rule.required,
            min: rule.min,
            max: rule.max
          })
          break
        default:
          result = validateString(value, name, {
            required: rule.required,
            minLength: rule.minLength,
            maxLength: rule.maxLength,
            pattern: rule.pattern
          })
      }
    }

    return result.isValid ? null : result.errors[0] || 'Campo inválido'
  }, [validationRules])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name])
      if (error) {
        newErrors[name] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validationRules, validateField])

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange && touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }))
    }
  }, [validateOnChange, touched, validateField])

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValue(name as string, value)
  }, [setValue])

  const setFieldTouched = useCallback((name: string, touchedValue: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: touchedValue }))
    
    if (touchedValue && validateOnBlur) {
      const error = validateField(name, values[name])
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }))
    }
  }, [validateOnBlur, validateField, values])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'number' ? Number(value) : value
    setValue(name, newValue)
  }, [setValue])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFieldTouched(e.target.name, true)
  }, [setFieldTouched])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    setSubmitError(null)
    
    // Marcar todos los campos como touched
    const allTouched: Record<string, boolean> = {}
    Object.keys(validationRules).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    // Validar formulario
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar el formulario'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validationRules, validateForm, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setSubmitError(null)
    setIsSubmitting(false)
  }, [initialValues])

  const resetField = useCallback((name: string) => {
    setValues(prev => ({ ...prev, [name]: initialValues[name] }))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
    setTouched(prev => {
      const newTouched = { ...prev }
      delete newTouched[name]
      return newTouched
    })
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setValue,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    reset,
    resetField,
    isValid: Object.keys(errors).length === 0
  }
}

