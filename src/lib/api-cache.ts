/**
 * Sistema de caching para API routes
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutos por defecto

  /**
   * Obtiene un valor del cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar si el entry ha expirado
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Guarda un valor en el cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    
    this.cache.set(key, entry)
  }

  /**
   * Elimina un valor del cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Limpia entradas expiradas
   */
  clean(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    // Iterar sobre las entradas de forma compatible con ES5
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })
    
    // Eliminar las entradas expiradas
    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })
  }

  /**
   * Verifica si existe una clave en el cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    // Verificar si ha expirado
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Obtiene el tamaño del cache
   */
  size(): number {
    this.clean() // Limpiar entradas expiradas primero
    return this.cache.size
  }
}

// Instancia singleton
export const apiCache = new ApiCache()

// Limpiar cache periódicamente (cada 10 minutos)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiCache.clean()
  }, 10 * 60 * 1000)
}

/**
 * Helper para crear una clave de cache
 */
export function createCacheKey(prefix: string, ...args: any[]): string {
  return `${prefix}:${args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(':')}`
}

/**
 * Decorator para cachear resultados de funciones
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyPrefix?: string
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  } = {}
): T {
  const { keyPrefix = 'cached', ttl, keyGenerator } = options

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : createCacheKey(keyPrefix, ...args)

    // Intentar obtener del cache
    const cached = apiCache.get<ReturnType<T>>(key)
    if (cached !== null) {
      return cached
    }

    // Ejecutar la función y cachear el resultado
    const result = await fn(...args)
    apiCache.set(key, result, ttl)
    
    return result
  }) as T
}

