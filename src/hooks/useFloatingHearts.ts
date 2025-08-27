'use client'

import { useState, useEffect } from 'react'
import { FloatingHeart } from '@/types'

export function useFloatingHearts() {
  const [hearts, setHearts] = useState<FloatingHeart[]>([])

  useEffect(() => {
    // Solo crear corazones si estamos en el cliente
    if (typeof window === 'undefined') return

    const interval = setInterval(() => {
      const newHeart: FloatingHeart = {
        id: Date.now() + Math.random(),
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 30
      }
      
      setHearts(prev => {
        // Limitar el número máximo de corazones a 5
        const updatedHearts = [...prev, newHeart]
        if (updatedHearts.length > 5) {
          return updatedHearts.slice(-5)
        }
        return updatedHearts
      })
      
      // Remover corazones después de 5 segundos
      setTimeout(() => {
        setHearts(prev => prev.filter(heart => heart.id !== newHeart.id))
      }, 5000)
    }, 3000) // Aumentar el intervalo para reducir la frecuencia

    return () => clearInterval(interval)
  }, [])

  return hearts
}
