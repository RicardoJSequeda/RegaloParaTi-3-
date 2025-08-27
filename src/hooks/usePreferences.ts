'use client'

import { useState, useEffect } from 'react'
import { UserPreferences } from '@/types'

const PREFERENCES_STORAGE_KEY = 'amor-app-preferences'

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    showFloatingHearts: true,
    floatingHeartsInDarkMode: true
  })

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const storedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences)
        setPreferences(parsedPreferences)
      } catch (error) {
        console.error('Error parsing stored preferences:', error)
        localStorage.removeItem(PREFERENCES_STORAGE_KEY)
      }
    }
  }, [])

  // Función para actualizar preferencias
  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences }
    setPreferences(updatedPreferences)
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPreferences))
  }

  return {
    preferences,
    updatePreferences
  }
}
