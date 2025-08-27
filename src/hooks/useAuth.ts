'use client'

import { useState, useEffect, useCallback } from 'react'
import { AuthState } from '@/types'

const AUTH_STORAGE_KEY = 'amor-app-auth'

// Función para obtener el estado inicial de forma segura
const getInitialAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      isLoggedIn: false,
      anniversaryDate: null
    }
  }
  
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      return JSON.parse(storedAuth)
    }
  } catch (error) {
    console.error('Error parsing stored auth:', error)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }
  
  return {
    isLoggedIn: false,
    anniversaryDate: null
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => getInitialAuthState())
  const [isInitialized, setIsInitialized] = useState(false)

  // Marcar como inicializado después del primer render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Función de login
  const login = useCallback((anniversaryDate: string) => {
    const newAuthState: AuthState = {
      isLoggedIn: true,
      anniversaryDate
    }
    setAuthState(newAuthState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState))
    }
  }, [])

  // Función de logout
  const logout = useCallback(() => {
    const newAuthState: AuthState = {
      isLoggedIn: false,
      anniversaryDate: null
    }
    setAuthState(newAuthState)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  return {
    ...authState,
    login,
    logout,
    isInitialized
  }
}
