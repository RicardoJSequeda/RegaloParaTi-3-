'use client'

import { useState, useCallback } from 'react'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  retries?: number
  retryDelay?: number
}

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const { onSuccess, onError, retries = 3, retryDelay = 1000 } = options
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (
    url: string,
    config: RequestInit = {}
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        setState({
          data,
          loading: false,
          error: null
        })

        if (onSuccess) {
          onSuccess(data)
        }

        return data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Si no es el último intento, esperar antes de reintentar
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
          continue
        }

        // Último intento falló
        setState({
          data: null,
          loading: false,
          error: lastError
        })

        if (onError) {
          onError(lastError)
        }

        return null
      }
    }

    return null
  }, [retries, retryDelay, onSuccess, onError])

  const get = useCallback((url: string, config?: RequestInit) => {
    return execute(url, { ...config, method: 'GET' })
  }, [execute])

  const post = useCallback((url: string, data: any, config?: RequestInit) => {
    return execute(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }, [execute])

  const put = useCallback((url: string, data: any, config?: RequestInit) => {
    return execute(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }, [execute])

  const patch = useCallback((url: string, data: any, config?: RequestInit) => {
    return execute(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }, [execute])

  const del = useCallback((url: string, config?: RequestInit) => {
    return execute(url, { ...config, method: 'DELETE' })
  }, [execute])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    reset
  }
}

