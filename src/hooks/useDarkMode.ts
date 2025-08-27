'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeState } from '@/types'

const THEME_STORAGE_KEY = 'amor-app-theme'

// Función para obtener el estado inicial de forma segura
const getInitialThemeState = (): ThemeState => {
  if (typeof window === 'undefined') {
    return { isDarkMode: false }
  }
  
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme) {
      return JSON.parse(storedTheme)
    }
  } catch (error) {
    console.error('Error parsing stored theme:', error)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(THEME_STORAGE_KEY)
    }
  }
  
  return { isDarkMode: false }
}

export function useDarkMode() {
  const [themeState, setThemeState] = useState<ThemeState>(() => getInitialThemeState())
  const [isInitialized, setIsInitialized] = useState(false)

  // Marcar como inicializado después del primer render
  useEffect(() => {
    setIsInitialized(true)
    
    // Aplicar tema al documento solo después de la inicialización
    if (themeState.isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [themeState.isDarkMode])

  // Función para alternar modo oscuro
  const toggleDarkMode = useCallback(() => {
    const newThemeState: ThemeState = {
      isDarkMode: !themeState.isDarkMode
    }
    setThemeState(newThemeState)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newThemeState))
      
      // Aplicar tema al documento
      if (newThemeState.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [themeState.isDarkMode])

  return {
    ...themeState,
    toggleDarkMode,
    isInitialized
  }
}
