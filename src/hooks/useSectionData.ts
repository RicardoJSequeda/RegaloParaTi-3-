'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useApi } from './useApi'
import { apiCache, createCacheKey } from '@/lib/api-cache'
import { Section } from '@/types'

interface UseSectionDataOptions {
  endpoint: string
  section: Section
  enabled?: boolean
  cacheTTL?: number
  refetchOnMount?: boolean
}

/**
 * Hook optimizado para cargar datos de secciones con caching y prefetching
 */
export function useSectionData<T = any>({
  endpoint,
  section,
  enabled = true,
  cacheTTL = 5 * 60 * 1000, // 5 minutos por defecto
  refetchOnMount = false
}: UseSectionDataOptions) {
  const { data, loading, error, get, reset } = useApi<T[]>()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Verificar cache primero
  const loadData = useCallback(async (force = false) => {
    if (!enabled) return

    const cacheKey = createCacheKey('section', section, endpoint)
    
    // Si no es forzado, verificar cache
    if (!force && !refetchOnMount) {
      const cached = apiCache.get<T[]>(cacheKey)
      if (cached) {
        // Simular setState pero usando el estado del hook useApi
        return cached
      }
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()

    try {
      const result = await get(endpoint, {
        signal: abortControllerRef.current.signal
      })

      if (result) {
        // Guardar en cache
        apiCache.set(cacheKey, result, cacheTTL)
        setIsInitialLoad(false)
      }

      return result
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error(`Error loading data for ${section}:`, error)
      }
      return null
    }
  }, [endpoint, section, enabled, cacheTTL, refetchOnMount, get])

  // Cargar datos al montar
  useEffect(() => {
    if (enabled) {
      loadData(refetchOnMount)
    }

    return () => {
      // Cleanup: cancelar request si el componente se desmonta
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled, section]) // Solo recargar si cambia la sección

  // Función para refrescar datos manualmente
  const refresh = useCallback(() => {
    const cacheKey = createCacheKey('section', section, endpoint)
    apiCache.delete(cacheKey)
    return loadData(true)
  }, [loadData, section, endpoint])

  // Función para prefetch (cargar datos antes de que se necesiten)
  const prefetch = useCallback(() => {
    if (!enabled) return
    const cacheKey = createCacheKey('section', section, endpoint)
    const cached = apiCache.get<T[]>(cacheKey)
    if (!cached) {
      loadData(false)
    }
  }, [loadData, section, endpoint, enabled])

  return {
    data: data || [],
    loading,
    error,
    isInitialLoad,
    refresh,
    prefetch,
    reset
  }
}

