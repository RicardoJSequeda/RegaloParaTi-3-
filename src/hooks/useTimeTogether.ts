'use client'

import { useState, useEffect } from 'react'

interface TimeTogether {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
}

export function useTimeTogether(startDate: string) {
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0
  })

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate)
      const now = new Date()
      const diff = now.getTime() - start.getTime()

      // Calcular años, meses, días
      const years = now.getFullYear() - start.getFullYear()
      const months = now.getMonth() - start.getMonth()
      const days = now.getDate() - start.getDate()

      // Ajustar por meses negativos
      let adjustedYears = years
      let adjustedMonths = months
      let adjustedDays = days

      if (adjustedDays < 0) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, start.getDate())
        adjustedDays = Math.floor((now.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24))
        adjustedMonths--
      }

      if (adjustedMonths < 0) {
        adjustedMonths += 12
        adjustedYears--
      }

      // Calcular horas, minutos, segundos
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Total de días
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24))

      setTimeTogether({
        years: adjustedYears,
        months: adjustedMonths,
        days: adjustedDays,
        hours,
        minutes,
        seconds,
        totalDays
      })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [startDate])

  return timeTogether
}
