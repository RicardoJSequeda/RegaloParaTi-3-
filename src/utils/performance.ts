/**
 * Utilidades de performance: debounce, throttle, etc.
 */

/**
 * Debounce: Ejecuta una función después de que haya pasado un tiempo determinado
 * desde la última vez que se llamó
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle: Ejecuta una función como máximo una vez por cada intervalo de tiempo
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Memoize: Cachea el resultado de una función
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Sleep: Espera un tiempo determinado (útil para delays)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * RequestAnimationFrame wrapper para mejor performance en animaciones
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      func(...args)
      rafId = null
    })
  }
}

/**
 * Batch updates: Agrupa múltiples actualizaciones en una sola
 */
export function batchUpdates(updates: Array<() => void>): void {
  // En React, esto se maneja automáticamente, pero podemos crear una versión para otros casos
  updates.forEach(update => update())
}

/**
 * Lazy load: Carga un módulo solo cuando se necesita
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>
): () => Promise<T> {
  let promise: Promise<T> | null = null

  return () => {
    if (!promise) {
      promise = importFn().then(module => module.default)
    }
    return promise
  }
}

