'use client'

import { useState, useEffect } from 'react'
import { Achievement, Plan } from '@/types'

const initialAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primer Plan',
    description: 'Crea tu primer plan especial',
    icon: '🎯',
    category: 'plans',
    condition: {
      type: 'plans_created',
      value: 1
    },
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: '2',
    title: 'Planificador',
    description: 'Crea 5 planes',
    icon: '📝',
    category: 'plans',
    condition: {
      type: 'plans_created',
      value: 5
    },
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: '3',
    title: 'Maestro Planificador',
    description: 'Crea 10 planes',
    icon: '📋',
    category: 'plans',
    condition: {
      type: 'plans_created',
      value: 10
    },
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: '4',
    title: 'Primera Aventura',
    description: 'Completa tu primer plan',
    icon: '✅',
    category: 'plans',
    condition: {
      type: 'plans_completed',
      value: 1
    },
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: '5',
    title: 'Aventurero',
    description: 'Completa 5 planes',
    icon: '🏆',
    category: 'plans',
    condition: {
      type: 'plans_completed',
      value: 5
    },
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: '6',
    title: 'Experto Aventurero',
    description: 'Completa 10 planes',
    icon: '👑',
    category: 'plans',
    condition: {
      type: 'plans_completed',
      value: 10
    },
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: '7',
    title: 'Romántico',
    description: 'Completa 3 planes románticos',
    icon: '💕',
    category: 'plans',
    condition: {
      type: 'romantic_plans_completed',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '8',
    title: 'Aventurero de Montaña',
    description: 'Completa 3 planes de aventura',
    icon: '🏔️',
    category: 'plans',
    condition: {
      type: 'adventure_plans_completed',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '9',
    title: 'Gastrónomo',
    description: 'Completa 3 planes gastronómicos',
    icon: '🍽️',
    category: 'plans',
    condition: {
      type: 'gastronomic_plans_completed',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '10',
    title: 'Racha de Éxitos',
    description: 'Completa 3 planes consecutivos',
    icon: '🔥',
    category: 'plans',
    condition: {
      type: 'streak',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '11',
    title: 'Organizador',
    description: 'Crea 5 planes con recordatorios',
    icon: '⏰',
    category: 'plans',
    condition: {
      type: 'plans_with_reminders',
      value: 5
    },
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: '12',
    title: 'Prioritario',
    description: 'Completa 3 planes de alta prioridad',
    icon: '⭐',
    category: 'plans',
    condition: {
      type: 'high_priority_completed',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '13',
    title: 'Cultural',
    description: 'Completa 3 planes culturales',
    icon: '🎭',
    category: 'plans',
    condition: {
      type: 'cultural_plans_completed',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '14',
    title: 'Relajado',
    description: 'Completa 3 planes de relax',
    icon: '🧘',
    category: 'plans',
    condition: {
      type: 'relax_plans_completed',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '15',
    title: 'Social',
    description: 'Crea 5 planes con participantes',
    icon: '👥',
    category: 'plans',
    condition: {
      type: 'plans_with_participants',
      value: 5
    },
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: '16',
    title: 'Consistente',
    description: 'Completa planes durante 7 días seguidos',
    icon: '📅',
    category: 'plans',
    condition: {
      type: 'weekly_streak',
      value: 7
    },
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: '17',
    title: 'Diverso',
    description: 'Completa planes de 5 categorías diferentes',
    icon: '🌈',
    category: 'plans',
    condition: {
      type: 'different_categories',
      value: 5
    },
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: '18',
    title: 'Puntual',
    description: 'Completa 5 planes en la fecha programada',
    icon: '🎯',
    category: 'plans',
    condition: {
      type: 'on_time_completed',
      value: 5
    },
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: '19',
    title: 'Viajero',
    description: 'Crea planes en 3 ubicaciones diferentes',
    icon: '🗺️',
    category: 'plans',
    condition: {
      type: 'different_locations',
      value: 3
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: '20',
    title: 'Maestro de la Planificación',
    description: 'Desbloquea todos los logros de planes',
    icon: '👑',
    category: 'plans',
    condition: {
      type: 'all_achievements',
      value: 19
    },
    unlocked: false,
    progress: 0,
    maxProgress: 19
  }
]

export function useAchievements(plans: Plan[]) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement[]>([])

  // Load achievements from localStorage on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem('achievements')
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements))
    } else {
      setAchievements(initialAchievements)
    }
  }, [])

  // Save achievements to localStorage when they change
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements))
  }, [achievements])

  // Check achievements when plans change
  useEffect(() => {
    checkAchievements()
  }, [plans])

  const checkAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement

      const { progress, shouldUnlock } = calculateProgress(achievement, plans)
      
      if (shouldUnlock && !achievement.unlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          progress
        }
        
        // Add to recently unlocked for notification
        setRecentlyUnlocked(prev => [...prev, unlockedAchievement])
        
        // Remove from recently unlocked after 5 seconds
        setTimeout(() => {
          setRecentlyUnlocked(prev => prev.filter(a => a.id !== achievement.id))
        }, 5000)
        
        return unlockedAchievement
      }
      
      return {
        ...achievement,
        progress
      }
    })

    setAchievements(updatedAchievements)
  }

  const calculateProgress = (achievement: Achievement, plans: Plan[]) => {
    const completedPlans = plans.filter(plan => plan.status === 'completado')
    const createdPlans = plans.length
    // Las categorías ya no existen en el tipo Plan simplificado
    const romanticPlans: Plan[] = []
    const adventurePlans: Plan[] = []
    const gastronomicPlans: Plan[] = []
    const culturalPlans: Plan[] = []
    const relaxPlans: Plan[] = []
    const highPriorityPlans: Plan[] = []
    const plansWithReminders: Plan[] = []
    const plansWithParticipants: Plan[] = []
    const onTimePlans = completedPlans.filter(plan => {
      const planDate = new Date(plan.date)
      const completedDate = new Date(plan.updatedAt)
      const diffDays = Math.abs(Math.floor((completedDate.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24)))
      return diffDays <= 1 // Completado en la fecha o un día después
    })
    const differentLocations = new Set(plans.map(plan => plan.location).filter(Boolean)).size
    const differentCategories = 0 // Ya no hay categorías
    const weeklyStreak = calculateWeeklyStreak(completedPlans)
    const unlockedAchievements = achievements.filter(a => a.unlocked).length

    let progress = 0
    let shouldUnlock = false

    switch (achievement.condition.type) {
      case 'plans_created':
        progress = Math.min(createdPlans, achievement.condition.value as number)
        shouldUnlock = createdPlans >= (achievement.condition.value as number)
        break
      
      case 'plans_completed':
        progress = Math.min(completedPlans.length, achievement.condition.value as number)
        shouldUnlock = completedPlans.length >= (achievement.condition.value as number)
        break
      
      case 'romantic_plans_completed':
        progress = Math.min(romanticPlans.length, achievement.condition.value as number)
        shouldUnlock = romanticPlans.length >= (achievement.condition.value as number)
        break
      
      case 'adventure_plans_completed':
        progress = Math.min(adventurePlans.length, achievement.condition.value as number)
        shouldUnlock = adventurePlans.length >= (achievement.condition.value as number)
        break
      
      case 'gastronomic_plans_completed':
        progress = Math.min(gastronomicPlans.length, achievement.condition.value as number)
        shouldUnlock = gastronomicPlans.length >= (achievement.condition.value as number)
        break
      
      case 'cultural_plans_completed':
        progress = Math.min(culturalPlans.length, achievement.condition.value as number)
        shouldUnlock = culturalPlans.length >= (achievement.condition.value as number)
        break
      
      case 'relax_plans_completed':
        progress = Math.min(relaxPlans.length, achievement.condition.value as number)
        shouldUnlock = relaxPlans.length >= (achievement.condition.value as number)
        break
      
      case 'high_priority_completed':
        progress = Math.min(highPriorityPlans.length, achievement.condition.value as number)
        shouldUnlock = highPriorityPlans.length >= (achievement.condition.value as number)
        break
      
      case 'plans_with_reminders':
        progress = Math.min(plansWithReminders.length, achievement.condition.value as number)
        shouldUnlock = plansWithReminders.length >= (achievement.condition.value as number)
        break
      
      case 'plans_with_participants':
        progress = Math.min(plansWithParticipants.length, achievement.condition.value as number)
        shouldUnlock = plansWithParticipants.length >= (achievement.condition.value as number)
        break
      
      case 'on_time_completed':
        progress = Math.min(onTimePlans.length, achievement.condition.value as number)
        shouldUnlock = onTimePlans.length >= (achievement.condition.value as number)
        break
      
      case 'different_locations':
        progress = Math.min(differentLocations, achievement.condition.value as number)
        shouldUnlock = differentLocations >= (achievement.condition.value as number)
        break
      
      case 'different_categories':
        progress = Math.min(differentCategories, achievement.condition.value as number)
        shouldUnlock = differentCategories >= (achievement.condition.value as number)
        break
      
      case 'weekly_streak':
        progress = Math.min(weeklyStreak, achievement.condition.value as number)
        shouldUnlock = weeklyStreak >= (achievement.condition.value as number)
        break
      
      case 'all_achievements':
        progress = Math.min(unlockedAchievements, achievement.condition.value as number)
        shouldUnlock = unlockedAchievements >= (achievement.condition.value as number)
        break
      
      case 'streak':
        const streak = calculateStreak(completedPlans)
        progress = Math.min(streak, achievement.condition.value as number)
        shouldUnlock = streak >= (achievement.condition.value as number)
        break
      
      default:
        progress = 0
        shouldUnlock = false
    }

    return { progress, shouldUnlock }
  }

  const calculateStreak = (completedPlans: Plan[]): number => {
    if (completedPlans.length === 0) return 0

    const sortedPlans = completedPlans
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    let streak = 1
    for (let i = 1; i < sortedPlans.length; i++) {
      const currentDate = new Date(sortedPlans[i - 1].updatedAt)
      const previousDate = new Date(sortedPlans[i].updatedAt)
      const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const calculateWeeklyStreak = (completedPlans: Plan[]): number => {
    if (completedPlans.length === 0) return 0

    const sortedPlans = completedPlans
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    let weeklyStreak = 0
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Contar planes completados en la última semana
    const recentPlans = sortedPlans.filter(plan => {
      const planDate = new Date(plan.updatedAt)
      return planDate >= oneWeekAgo
    })

    // Agrupar por semana
    const weeklyGroups = new Map<string, number>()
    recentPlans.forEach(plan => {
      const planDate = new Date(plan.updatedAt)
      const weekStart = new Date(planDate)
      weekStart.setDate(planDate.getDate() - planDate.getDay()) // Domingo
      weekStart.setHours(0, 0, 0, 0)
      
      const weekKey = weekStart.toISOString().split('T')[0]
      weeklyGroups.set(weekKey, (weeklyGroups.get(weekKey) || 0) + 1)
    })

    // Contar semanas consecutivas con al menos un plan completado
    const weeks = Array.from(weeklyGroups.keys()).sort().reverse()
    for (let i = 0; i < weeks.length; i++) {
      const weekDate = new Date(weeks[i])
      const expectedWeekDate = new Date(today)
      expectedWeekDate.setDate(today.getDate() - (i * 7))
      expectedWeekDate.setDate(expectedWeekDate.getDate() - expectedWeekDate.getDay())
      expectedWeekDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.abs(Math.floor((weekDate.getTime() - expectedWeekDate.getTime()) / (1000 * 60 * 60 * 24)))
      
      if (diffDays <= 7) {
        weeklyStreak++
      } else {
        break
      }
    }

    return weeklyStreak
  }

  const getAchievementsByCategory = (category: Achievement['category']) => {
    return achievements.filter(achievement => achievement.category === category)
  }

  const getUnlockedAchievements = () => {
    return achievements.filter(achievement => achievement.unlocked)
  }

  const getLockedAchievements = () => {
    return achievements.filter(achievement => !achievement.unlocked)
  }

  const getProgressPercentage = () => {
    if (achievements.length === 0) return 0
    const unlocked = achievements.filter(achievement => achievement.unlocked).length
    return Math.round((unlocked / achievements.length) * 100)
  }

  const resetAchievements = () => {
    setAchievements(initialAchievements)
    setRecentlyUnlocked([])
  }

  return {
    achievements,
    recentlyUnlocked,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getLockedAchievements,
    getProgressPercentage,
    resetAchievements
  }
}
