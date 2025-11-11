'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

interface TimeTogether {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  nextAnniversary: {
    date: Date
    daysUntil: number
  }
}

export function useTimeTogether(startDate: string) {
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
    nextAnniversary: {
      date: new Date(),
      daysUntil: 0
    }
  })

  // Calcular el próximo aniversario
  const calculateNextAnniversary = useCallback((startDate: Date, currentDate: Date) => {
    const currentYear = currentDate.getFullYear()
    const startMonth = startDate.getMonth()
    const startDay = startDate.getDate()
    
    // Crear fecha de aniversario para este año
    let nextAnniversary = new Date(currentYear, startMonth, startDay)
    
    // Si el aniversario ya pasó este año, usar el del próximo año
    if (nextAnniversary < currentDate) {
      nextAnniversary = new Date(currentYear + 1, startMonth, startDay)
    }
    
    // Calcular días hasta el aniversario
    const diffTime = nextAnniversary.getTime() - currentDate.getTime()
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      date: nextAnniversary,
      daysUntil: Math.max(0, daysUntil)
    }
  }, [])

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate + 'T00:00:00')
      const now = new Date()
      const diff = now.getTime() - start.getTime()

      if (diff < 0) {
        // Si la fecha de inicio es en el futuro, retornar valores en cero
        setTimeTogether({
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalDays: 0,
          nextAnniversary: calculateNextAnniversary(start, now)
        })
        return
      }

      // Calcular años, meses, días de forma más precisa
      let years = now.getFullYear() - start.getFullYear()
      let months = now.getMonth() - start.getMonth()
      let days = now.getDate() - start.getDate()

      // Ajustar si los días son negativos
      if (days < 0) {
        months--
        // Obtener el último día del mes anterior
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
        days += lastDayOfPrevMonth
      }

      // Ajustar si los meses son negativos
      if (months < 0) {
        years--
        months += 12
      }

      // Calcular horas, minutos, segundos desde medianoche
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      // Total de días
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24))

      // Calcular próximo aniversario
      const nextAnniversary = calculateNextAnniversary(start, now)

      setTimeTogether({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
        nextAnniversary
      })
    }

    // Calcular inmediatamente
    calculateTime()
    
    // Actualizar cada segundo
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [startDate, calculateNextAnniversary])

  return timeTogether
}
