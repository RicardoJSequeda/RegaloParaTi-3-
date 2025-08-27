import { useState, useEffect, useCallback } from 'react'

// Función para obtener el valor inicial de forma segura
const getInitialValue = <T>(key: string, initialValue: T): T => {
  if (typeof window === 'undefined') {
    return initialValue
  }
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  } catch (error) {
    console.error(`Error al leer localStorage key "${key}":`, error)
    return initialValue
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor usando lazy initialization
  const [storedValue, setStoredValue] = useState<T>(() => getInitialValue(key, initialValue))
  const [isInitialized, setIsInitialized] = useState(false)

  // Marcar como inicializado después del primer render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Función para establecer el valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permite que el valor sea una función para que tengamos la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Guarda en el estado
      setStoredValue(valueToStore)
      
      // Guarda en localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error al establecer localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Función para eliminar el valor
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error al eliminar localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Función para limpiar todos los datos
  const clearAll = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
      }
    } catch (error) {
      console.error('Error al limpiar localStorage:', error)
    }
  }, [])

  // Función para obtener el tamaño de los datos almacenados
  const getStorageSize = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const data = window.localStorage.getItem(key)
        return data ? new Blob([data]).size : 0
      }
      return 0
    } catch (error) {
      console.error('Error al calcular el tamaño del storage:', error)
      return 0
    }
  }, [key])

  // Función para verificar si hay datos
  const hasData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key) !== null
      }
      return false
    } catch (error) {
      console.error('Error al verificar datos en storage:', error)
      return false
    }
  }, [key])

  // Función para hacer backup de los datos
  const exportData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const data = window.localStorage.getItem(key)
        if (data) {
          const blob = new Blob([data], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${key}_backup_${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Error al exportar datos:', error)
    }
  }, [key])

  return {
    value: storedValue,
    setValue,
    removeValue,
    clearAll,
    getStorageSize,
    hasData,
    exportData,
    isInitialized
  }
}
