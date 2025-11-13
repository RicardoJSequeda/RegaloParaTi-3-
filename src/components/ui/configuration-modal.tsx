'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bell, ClipboardCheck, Activity, CalendarDays, Gift, Sparkles, MapPin, Star, Plus, ChefHat, Film, Target, Star as StarIcon } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/hooks/useNotifications'

//

interface ConfigurationModalProps {
  open: boolean
  // @ts-ignore - Next.js warning: This is a valid React callback in client component, not a Server Action. Safe to ignore.
  onOpenChange: (v: boolean) => void
}

// @ts-ignore - Next.js warning: Valid React callback in client component, not a Server Action
export default function ConfigurationModal({ open, onOpenChange }: ConfigurationModalProps) {
  const supabase = getBrowserClient()
  const { sendNotification, requestPermission, permission, isSupported } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  // Estado local de notificaciones (persistido en localStorage)
  // status: 'new' | 'seen' | 'snoozed' | 'dismissed'; snoozeUntil: ISO string
  const [notifState, setNotifState] = useState<Record<string, { status: string; snoozeUntil?: string }>>({})
  // Solo mostrar próximas/urgentes, sin filtros adicionales
  const [summary, setSummary] = useState<any>({
    surpriseOfWeek: null,
    surprisesUnlockableNow: [],
    surprisesUpcomingSoon: []
  })

  // Secciones colapsables
  const [showUnlockable, setShowUnlockable] = useState(true)
  const [showUpcoming, setShowUpcoming] = useState(true)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const [notifications, setNotifications] = useState<any[]>([])

  // Solo notificaciones en este modal

  useEffect(() => {
    // cargar estado local de notificaciones
    try {
      const raw = localStorage.getItem('surpriseNotifState')
      if (raw) setNotifState(JSON.parse(raw))
    } catch {}
    
    // Solicitar permisos de notificación cuando se abra el modal
    if (open && isSupported && permission === 'default') {
      requestPermission()
    }
    
    if (!open) return
    const load = async () => {
      try {
        setLoading(true)
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        const todayStr = now.toISOString().split('T')[0]
        const next24h = tomorrow.toISOString()
        const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const weekAheadStr = weekAhead.toISOString().split('T')[0]

        const [tasksRes, healthRes, plansRes, surprisesRes, placesRes, messagesRes, recipesRes, moviesRes, goalsRes, dreamsRes] = await Promise.all([
          supabase.from('pet_tasks').select('*').eq('status', 'pendiente').order('next_due', { ascending: true }),
          supabase.from('pet_health_records').select('*').order('next_due', { ascending: true }),
          supabase.from('plans').select('*').gte('date', todayStr).lte('date', weekAheadStr).order('date', { ascending: true }),
          supabase.from('surprises').select('*').order('unlock_date', { ascending: true }),
          supabase.from('places').select('*').eq('status', 'pendiente').order('created_at', { ascending: true }),
          supabase.from('messages').select('*').eq('is_read', false).order('created_at', { ascending: false }),
          supabase.from('recipes').select('*').order('rating', { ascending: false }),
          supabase.from('movies').select('*').order('created_at', { ascending: false }),
          supabase.from('goals').select('*').order('created_at', { ascending: false }),
          supabase.from('dreams').select('*').order('created_at', { ascending: false })
        ])

        // Sorpresa destacada: si hay una dentro de 7 días, mostrar la más próxima; si no, mostrar la más futura
        const allSurprises = (surprisesRes.data || []) as any[]
        const upcoming = allSurprises.filter((s: any) => s.unlock_date)
        const nowMs = now.getTime()
        const weekMs = 7 * 24 * 60 * 60 * 1000
        let surpriseOfWeek: any = null
        if (upcoming.length) {
          const withDelta = upcoming.map((s: any) => ({ ...s, delta: Math.max(0, new Date(s.unlock_date).getTime() - nowMs) }))
          const withinWeek = withDelta.filter((s: any) => s.delta <= weekMs)
          const pick = (withinWeek.length ? withinWeek : withDelta).sort((a: any, b: any) => a.delta - b.delta)[0]
          surpriseOfWeek = pick
        }

        // Notificaciones de sorpresas: abribles ahora y próximas (≤ 7 días)
        const surpriseById: Record<string, any> = Object.fromEntries(allSurprises.map(s => [s.id, s]))
        
        // Lógica mejorada para sorpresas abribles
        const surprisesUnlockableNow = allSurprises.filter((s: any) => {
          // Si ya está desbloqueada, no mostrar notificación
          if (s.is_unlocked) return false
          
          // Si es de tipo 'free', está disponible
          if (s.unlock_type === 'free') return true
          
          // Si es de tipo 'date' y la fecha ya pasó
          if (s.unlock_type === 'date' && s.unlock_date) {
            const d = new Date(s.unlock_date).getTime()
            return d <= nowMs
          }
          
          // Si es de tipo 'sequential' y no depende de otra, está disponible
          if (s.unlock_type === 'sequential' && !s.depends_on) return true
          
          // Si es de tipo 'sequential' y depende de otra que ya está desbloqueada
          if (s.unlock_type === 'sequential' && s.depends_on) {
            const dep = surpriseById[s.depends_on]
            return dep && dep.is_unlocked
          }
          
          // Para sorpresas de tipo 'key', también mostrarlas como disponibles
          if (s.unlock_type === 'key') return true
          
          return false
        })

        // Lógica mejorada para sorpresas próximas
        const surprisesUpcomingSoon = allSurprises
          .filter((s: any) => {
            // Solo sorpresas que no están desbloqueadas y tienen fecha
            return !s.is_unlocked && s.unlock_date && s.unlock_type === 'date'
          })
          .map((s: any) => ({ ...s, delta: Math.max(0, new Date(s.unlock_date).getTime() - nowMs) }))
          .filter((s: any) => s.delta > 0 && s.delta <= weekMs)
          .sort((a: any, b: any) => a.delta - b.delta)
          .slice(0, 5)

        // Debug: mostrar información en consola
        console.log('🔍 Debug Sorpresas:', {
          total: allSurprises.length,
          unlockable: surprisesUnlockableNow.length,
          upcoming: surprisesUpcomingSoon.length,
          unlockableDetails: surprisesUnlockableNow.map(s => ({ id: s.id, title: s.title, type: s.unlock_type })),
          upcomingDetails: surprisesUpcomingSoon.map(s => ({ id: s.id, title: s.title, date: s.unlock_date }))
        })

        setSummary({
          surpriseOfWeek,
          surprisesUnlockableNow,
          surprisesUpcomingSoon
        })

        // Construir lista unificada de notificaciones (solo próximas/urgentes)
        const notif: any[] = []

        // Tareas próximas (24h)
        const tasksDueSoon = (tasksRes.data || []).filter((t: any) => t.next_due && t.next_due <= tomorrow.toISOString())
        for (const t of tasksDueSoon) {
          notif.push({
            id: `task:${t.id}`,
            kind: 'task',
            title: t.title || 'Tarea pendiente',
            desc: t.description || 'Vence pronto',
            when: t.next_due,
            icon: 'task'
          })
        }

        // Salud próxima (7 días)
        const healthDueSoon = (healthRes.data || []).filter((h: any) => h.next_due && new Date(h.next_due).getTime() <= weekAhead.getTime())
        for (const h of healthDueSoon) {
          notif.push({
            id: `health:${h.id}`,
            kind: 'health',
            title: h.title || 'Salud próxima',
            desc: h.notes || 'Próxima cita/registro',
            when: h.next_due,
            icon: 'health'
          })
        }

        // Planes próximos (hoy..7 días)
        for (const p of (plansRes.data || [])) {
          const dateTime = p.time ? `${p.date}T${p.time}:00` : `${p.date}T00:00:00`
          notif.push({
            id: `plan:${p.id}`,
            kind: 'plan',
            title: p.title || 'Plan',
            desc: p.description || 'Actividad programada',
            when: dateTime,
            icon: 'plan'
          })
        }

                 // === NOTIFICACIONES DE SORPRESAS ===
         
         // 1. Sorpresas que se pueden abrir ahora
         const unlockableCount = surprisesUnlockableNow.length
         if (unlockableCount > 0) {
           notif.push({
             id: 'surprise_unlockable_summary',
             kind: 'surprise_unlockable',
             title: `¡${unlockableCount} sorpresa${unlockableCount > 1 ? 's' : ''} lista${unlockableCount > 1 ? 's' : ''} para abrir!`,
             desc: unlockableCount === 1 
               ? `"${surprisesUnlockableNow[0].title}" está disponible ahora`
               : `Tienes ${unlockableCount} sorpresas esperando ser descubiertas`,
             when: new Date().toISOString(),
             icon: 'surprise_unlockable',
             priority: 'high'
           })
         }

         // 2. Sorpresas próximas a abrirse
         if (surprisesUpcomingSoon.length > 0) {
           const closest = surprisesUpcomingSoon[0]
           const daysUntil = Math.ceil((new Date(closest.unlock_date).getTime() - nowMs) / (24 * 60 * 60 * 1000))
           
           notif.push({
             id: 'surprise_upcoming_week',
             kind: 'surprise_upcoming',
             title: `${surprisesUpcomingSoon.length} sorpresa${surprisesUpcomingSoon.length > 1 ? 's' : ''} próxima${surprisesUpcomingSoon.length > 1 ? 's' : ''} a abrirse`,
             desc: daysUntil === 0 
               ? `"${closest.title}" se abre hoy`
               : daysUntil === 1
               ? `"${closest.title}" se abre mañana`
               : `La más cercana: "${closest.title}" en ${daysUntil} días`,
             when: closest.unlock_date,
             icon: 'surprise_upcoming',
             priority: 'medium'
           })
         }

                   // 3. Notificación de debug si no hay sorpresas (temporal)
          if (allSurprises.length > 0 && surprisesUnlockableNow.length === 0 && surprisesUpcomingSoon.length === 0) {
            notif.push({
              id: 'surprise_debug_info',
              kind: 'surprise_unlockable',
              title: `Información de sorpresas`,
              desc: `Tienes ${allSurprises.length} sorpresa(s) en total. Revisa la consola para más detalles.`,
              when: new Date().toISOString(),
              icon: 'surprise_unlockable',
              priority: 'low'
            })
          }

                  // === NOTIFICACIONES DE MENSAJES SIN LEER ===
          
                     // 4. Mensajes sin leer
           const unreadMessages = (messagesRes.data || []) as any[]
           if (unreadMessages.length > 0) {
             notif.push({
               id: 'messages_unread_summary',
               kind: 'message_unread',
               title: `${unreadMessages.length} mensaje${unreadMessages.length > 1 ? 's' : ''} sin leer`,
               desc: unreadMessages.length === 1
                 ? `"${unreadMessages[0].title}" espera ser leído`
                 : `Tienes ${unreadMessages.length} mensajes esperando ser leídos`,
               when: new Date().toISOString(),
               icon: 'message_unread',
               priority: 'medium'
             })
           }

                   // === NOTIFICACIONES DE RECETAS INTELIGENTES ===
           
           // 5. Receta sugerida según la hora del día
           const allRecipes = (recipesRes.data || []) as any[]
           if (allRecipes.length > 0) {
             const currentHour = now.getHours()
             let mealTime: string
             let mealCategory: string
             
             // Determinar la hora de comida basada en la hora actual
             if (currentHour >= 6 && currentHour < 11) {
               mealTime = 'desayuno'
               mealCategory = 'desayuno'
             } else if (currentHour >= 11 && currentHour < 16) {
               mealTime = 'almuerzo'
               mealCategory = 'almuerzo'
             } else if (currentHour >= 16 && currentHour < 21) {
               mealTime = 'cena'
               mealCategory = 'cena'
             } else {
               // Fuera de horarios principales, sugerir snack o postre
               mealTime = 'snack'
               mealCategory = 'snack'
             }
             
             // Filtrar recetas por categoría de comida
             const suitableRecipes = allRecipes.filter((recipe: any) => {
               if (mealCategory === 'snack') {
                 return ['snack', 'postre', 'bebida'].includes(recipe.category)
               }
               return recipe.category === mealCategory
             })
             
             if (suitableRecipes.length > 0) {
               // Seleccionar la mejor receta (favorita o con mejor rating)
               const bestRecipe = suitableRecipes.find((r: any) => r.isFavorite) || 
                                 suitableRecipes.find((r: any) => r.rating && r.rating >= 4) ||
                                 suitableRecipes[0]
               
               notif.push({
                 id: 'recipe_suggestion',
                 kind: 'recipe_suggestion',
                 title: `¡Es hora de ${mealTime}!`,
                 desc: `"${bestRecipe.title}" sería perfecta para este momento`,
                 when: new Date().toISOString(),
                 icon: 'recipe_suggestion',
                 priority: 'medium'
               })
             }
                       }

                    // === NOTIFICACIONES DE PELÍCULAS Y SERIES ===
            
            // 6. Películas y series pendientes
            const allMovies = (moviesRes.data || []) as any[]
            if (allMovies.length > 0) {
              const pendingMovies = allMovies.filter((m: any) => m.status === 'pendiente')
              const pendingPeliculas = pendingMovies.filter((m: any) => m.type === 'pelicula')
              const pendingSeries = pendingMovies.filter((m: any) => m.type === 'serie')
              
              if (pendingMovies.length > 0) {
                notif.push({
                  id: 'movies_pending_summary',
                  kind: 'movie_pending',
                  title: `${pendingMovies.length} película${pendingMovies.length > 1 ? 's' : ''} y serie${pendingMovies.length > 1 ? 's' : ''} pendiente${pendingMovies.length > 1 ? 's' : ''}`,
                  desc: `${pendingPeliculas.length} película${pendingPeliculas.length > 1 ? 's' : ''} y ${pendingSeries.length} serie${pendingSeries.length > 1 ? 's' : ''} esperando ser vistas`,
                  when: new Date().toISOString(),
                  icon: 'movie_pending',
                  priority: 'medium'
                })
              }
              
              // 7. Recomendación inteligente de película/serie
              const availableMovies = allMovies.filter((m: any) => 
                m.status === 'pendiente' || m.status === 'en_progreso'
              )
              
              if (availableMovies.length > 0) {
                // Seleccionar la mejor opción (favorita, mejor género, o más reciente)
                const bestMovie = availableMovies.find((m: any) => m.isFavorite) ||
                                 availableMovies.find((m: any) => ['romantico', 'comedia', 'drama'].includes(m.genre)) ||
                                 availableMovies[0]
                
                const movieType = bestMovie.type === 'pelicula' ? 'película' : 'serie'
                const genreNames: Record<string, string> = {
                  'romantico': 'romántica',
                  'accion': 'de acción',
                  'comedia': 'de comedia',
                  'drama': 'dramática',
                  'terror': 'de terror',
                  'ciencia_ficcion': 'de ciencia ficción',
                  'fantasia': 'de fantasía',
                  'thriller': 'de thriller',
                  'animacion': 'animada',
                  'documental': 'documental',
                  'biografico': 'biográfica',
                  'historico': 'histórica',
                  'musical': 'musical',
                  'western': 'western',
                  'policial': 'policial',
                  'misterio': 'de misterio',
                  'aventura': 'de aventura',
                  'otro': 'interesante'
                }
                
                const genreName = genreNames[bestMovie.genre] || 'interesante'
                
                notif.push({
                  id: 'movie_recommendation',
                  kind: 'movie_recommendation',
                  title: `¿Qué tal una ${movieType} ${genreName}?`,
                  desc: `"${bestMovie.title}" sería perfecta para este momento`,
                  when: new Date().toISOString(),
                  icon: 'movie_recommendation',
                  priority: 'low'
                })
              }
                         }

                     // === NOTIFICACIONES DE METAS Y SUEÑOS ===
            
            // 8. Metas con fechas límite próximas
            const allGoals = (goalsRes.data || []) as any[]
            if (allGoals.length > 0) {
              const activeGoals = allGoals.filter((g: any) => 
                g.status === 'pendiente' || g.status === 'en_progreso'
              )
              
              // Metas con fechas límite próximas (≤ 30 días)
              const goalsWithDeadlines = activeGoals.filter((g: any) => g.targetDate)
              const upcomingDeadlines = goalsWithDeadlines
                .map((g: any) => ({ ...g, daysUntil: Math.ceil((new Date(g.targetDate).getTime() - nowMs) / (24 * 60 * 60 * 1000)) }))
                .filter((g: any) => g.daysUntil > 0 && g.daysUntil <= 30)
                .sort((a: any, b: any) => a.daysUntil - b.daysUntil)
              
              if (upcomingDeadlines.length > 0) {
                const closestGoal = upcomingDeadlines[0]
                notif.push({
                  id: 'goal_deadline_reminder',
                  kind: 'goal_deadline',
                  title: `¡Meta próxima a vencer!`,
                  desc: closestGoal.daysUntil === 1
                    ? `"${closestGoal.title}" vence mañana`
                    : `"${closestGoal.title}" vence en ${closestGoal.daysUntil} días`,
                  when: closestGoal.targetDate,
                  icon: 'goal_deadline',
                  priority: 'high'
                })
              }
              
              // Metas con progreso bajo que necesitan atención
              const lowProgressGoals = activeGoals.filter((g: any) => g.progress < 30)
              if (lowProgressGoals.length > 0) {
                const randomLowProgressGoal = lowProgressGoals[Math.floor(Math.random() * lowProgressGoals.length)]
                notif.push({
                  id: 'goal_low_progress',
                  kind: 'goal_low_progress',
                  title: `¡Tu meta necesita atención!`,
                  desc: `"${randomLowProgressGoal.title}" está al ${randomLowProgressGoal.progress}% - ¡Tú puedes lograrlo!`,
                  when: new Date().toISOString(),
                  icon: 'goal_low_progress',
                  priority: 'medium'
                })
              }
              
              // Metas completadas recientemente (últimos 7 días)
              const recentlyCompleted = allGoals.filter((g: any) => 
                g.status === 'completado' && g.completedDate
              ).filter((g: any) => {
                const completedDate = new Date(g.completedDate)
                const daysSinceCompletion = Math.floor((nowMs - completedDate.getTime()) / (24 * 60 * 60 * 1000))
                return daysSinceCompletion <= 7
              })
              
              if (recentlyCompleted.length > 0) {
                const latestCompleted = recentlyCompleted[0]
                notif.push({
                  id: 'goal_recently_completed',
                  kind: 'goal_completed',
                  title: `¡Felicidades! 🎉`,
                  desc: `Completaste "${latestCompleted.title}" - ¡Eres increíble!`,
                  when: latestCompleted.completedDate,
                  icon: 'goal_completed',
                  priority: 'medium'
                })
              }
            }
            
            // 9. Sueños pendientes y motivación
            const allDreams = (dreamsRes.data || []) as any[]
            if (allDreams.length > 0) {
              const pendingDreams = allDreams.filter((d: any) => !d.isAchieved)
              
              if (pendingDreams.length > 0) {
                // Seleccionar un sueño aleatorio para motivar
                const randomDream = pendingDreams[Math.floor(Math.random() * pendingDreams.length)]
                const dreamCategoryNames: Record<string, string> = {
                  'viaje': 'viaje',
                  'hogar': 'hogar',
                  'experiencia': 'experiencia',
                  'objeto': 'objeto',
                  'logro': 'logro',
                  'otro': 'sueño'
                }
                
                const categoryName = dreamCategoryNames[randomDream.category] || 'sueño'
                
                notif.push({
                  id: 'dream_motivation',
                  kind: 'dream_motivation',
                  title: `¡Tu ${categoryName} te espera!`,
                  desc: `"${randomDream.title}" - Cada día te acerca más a lograrlo`,
                  when: new Date().toISOString(),
                  icon: 'dream_motivation',
                  priority: 'low'
                })
              }
              
              // Sueños logrados recientemente
              const recentlyAchieved = allDreams.filter((d: any) => 
                d.isAchieved && d.achievedDate
              ).filter((d: any) => {
                const achievedDate = new Date(d.achievedDate)
                const daysSinceAchievement = Math.floor((nowMs - achievedDate.getTime()) / (24 * 60 * 60 * 1000))
                return daysSinceAchievement <= 7
              })
              
              if (recentlyAchieved.length > 0) {
                const latestAchieved = recentlyAchieved[0]
                notif.push({
                  id: 'dream_recently_achieved',
                  kind: 'dream_achieved',
                  title: `¡Sueño cumplido! ✨`,
                  desc: `Lograste "${latestAchieved.title}" - ¡Los sueños se hacen realidad!`,
                  when: latestAchieved.achievedDate,
                  icon: 'dream_achieved',
                  priority: 'medium'
                })
              }
            }

                     // === NOTIFICACIONES DE LUGARES PENDIENTES ===
         
         // 7. Lugares pendientes de visitar (resumen general)
         const pendingPlaces = (placesRes.data || []) as any[]
         if (pendingPlaces.length > 0) {
           notif.push({
             id: 'places_pending_summary',
             kind: 'place_pending',
             title: `${pendingPlaces.length} lugar${pendingPlaces.length > 1 ? 'es' : ''} pendiente${pendingPlaces.length > 1 ? 's' : ''} de visitar`,
             desc: pendingPlaces.length === 1
               ? `"${pendingPlaces[0].name}" espera ser descubierto`
               : `Tienes ${pendingPlaces.length} lugares esperando ser visitados`,
             when: new Date().toISOString(),
             icon: 'place_pending',
             priority: 'medium'
           })
         }

                   // 8. Lugar con fecha de visita más cercana
          if (pendingPlaces.length > 0) {
            // Filtrar lugares que tienen fecha de visita programada
            const placesWithVisitDate = pendingPlaces.filter(place => place.visit_date)
            
            if (placesWithVisitDate.length > 0) {
              // Ordenar por fecha de visita (más cercana primero)
              const sortedPlaces = [...placesWithVisitDate].sort((a, b) => {
                const dateA = new Date(a.visit_date).getTime()
                const dateB = new Date(b.visit_date).getTime()
                return dateA - dateB // Más cercana primero
              })
              
              const closestPlace = sortedPlaces[0]
              const visitDate = new Date(closestPlace.visit_date)
              const daysUntilVisit = Math.floor((visitDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
              
              notif.push({
                id: 'places_closest_date',
                kind: 'place_recent',
                title: `Próxima visita: "${closestPlace.name}"`,
                desc: daysUntilVisit === 0
                  ? `Visita programada para hoy - ${closestPlace.address || 'Sin dirección'}`
                  : daysUntilVisit === 1
                  ? `Visita programada para mañana - ${closestPlace.address || 'Sin dirección'}`
                  : daysUntilVisit < 0
                  ? `Visita vencida hace ${Math.abs(daysUntilVisit)} días - ${closestPlace.address || 'Sin dirección'}`
                  : `Visita programada en ${daysUntilVisit} días - ${closestPlace.address || 'Sin dirección'}`,
                when: closestPlace.visit_date,
                icon: 'place_recent',
                priority: daysUntilVisit <= 0 ? 'high' : 'low'
              })
            }
          }



        notif.sort((a, b) => {
          // Priorizar por tipo de prioridad
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority
          }
          
          // Si misma prioridad, ordenar por fecha
          return new Date(a.when).getTime() - new Date(b.when).getTime()
        })
        
        setNotifications(notif)
        setLastUpdated(new Date())
        
        // Enviar notificaciones del navegador para las nuevas notificaciones
        if (isSupported && permission === 'granted') {
          notif.forEach((notification: any) => {
            // Solo enviar notificaciones del navegador para notificaciones de alta prioridad
            if (notification.priority === 'high' || notification.kind === 'surprise_unlockable') {
              sendNotification({
                title: notification.title,
                body: notification.desc || 'Tienes una notificación importante',
                icon: '/favicon.ico',
                tag: notification.id,
                requireInteraction: notification.priority === 'high'
              })
            }
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    // Auto-refresh mientras el modal esté abierto
    const id = setInterval(() => {
      setRefreshing(true)
      load().finally(() => setRefreshing(false))
    }, 60000)
    // Suscripciones en tiempo real
    const channel = supabase
      .channel('notifications_panel_changes')
             .on('postgres_changes', { event: '*', schema: 'public', table: 'surprises' }, () => {
               load()
               // Enviar notificación del navegador para sorpresas nuevas
               if (isSupported && permission === 'granted') {
                 sendNotification({
                   title: '¡Nueva sorpresa disponible!',
                   body: 'Se ha agregado una nueva sorpresa a tu lista',
                   icon: '/favicon.ico',
                   tag: 'new_surprise',
                   requireInteraction: false
                 })
               }
             })
       .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_tasks' }, () => load())
       .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_health_records' }, () => load())
       .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => load())
       .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, () => load())
       .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
         load()
         // Enviar notificación del navegador para mensajes nuevos
         if (isSupported && permission === 'granted') {
           sendNotification({
             title: '¡Nuevo mensaje!',
             body: 'Tienes un nuevo mensaje esperando ser leído',
             icon: '/favicon.ico',
             tag: 'new_message',
             requireInteraction: false
           })
         }
       })
       .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => load())
       .on('postgres_changes', { event: '*', schema: 'public', table: 'movies' }, () => load())
       .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
         load()
         // Enviar notificación del navegador para metas con fechas límite próximas
         if (isSupported && permission === 'granted') {
           sendNotification({
             title: '¡Meta próxima a vencer!',
             body: 'Tienes una meta con fecha límite próxima',
             icon: '/favicon.ico',
             tag: 'goal_deadline',
             requireInteraction: true
           })
         }
       })
       .on('postgres_changes', { event: '*', schema: 'public', table: 'dreams' }, () => load())
      .subscribe()

    return () => {
      clearInterval(id)
      supabase.removeChannel(channel)
    }
  }, [open, supabase])

  // Efecto para limpiar notificaciones snoozed cada 10 minutos
  useEffect(() => {
    if (!open) return

    const cleanupInterval = setInterval(() => {
      clearSnoozedNotifications()
    }, 10 * 60 * 1000) // 10 minutos

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [open, notifState, notifications, summary])

  const hasAlerts = useMemo(() => {
    return (
      (summary.surprisesUnlockableNow?.length || 0) > 0 ||
      (summary.surprisesUpcomingSoon?.length || 0) > 0
    )
  }, [summary])

  const visibleNotifications = useMemo(() => {
    const now = new Date()
    return notifications.filter(n => {
      const state = notifState[n.id]
      
      // Si no hay estado, mostrar la notificación
      if (!state) return true
      
      // Si está marcada como 'new', mostrarla
      if (state.status === 'new') return true
      
      // Si está en snooze, verificar si ya pasó el tiempo
      if (state.status === 'snoozed' && state.snoozeUntil) {
        const snoozeTime = new Date(state.snoozeUntil)
        return now >= snoozeTime // Mostrar si ya pasó el tiempo de snooze
      }
      
      // Si está marcada como 'seen' permanentemente, no mostrarla
      if (state.status === 'seen') return false
      
      // Por defecto, mostrar
      return true
    })
  }, [notifications, notifState])

  const persistNotifState = (next: Record<string, { status: string; snoozeUntil?: string }>) => {
    setNotifState(next)
    try { localStorage.setItem('surpriseNotifState', JSON.stringify(next)) } catch {}
  }

  const markAsSeen = (id: string) => {
    // Marcar como vista temporalmente (se volverá a mostrar en 10 minutos si aún aplica)
    const snoozeUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
    persistNotifState({ ...notifState, [id]: { status: 'snoozed', snoozeUntil } })
    
    // Enviar notificación del navegador confirmando la acción
    if (isSupported && permission === 'granted') {
      const notification = notifications.find(n => n.id === id)
      if (notification) {
        sendNotification({
          title: 'Notificación marcada como vista',
          body: `"${notification.title}" se ocultará por 10 minutos`,
          icon: '/favicon.ico',
          tag: `seen_${id}`,
          requireInteraction: false
        })
      }
    }
  }

  const markAsPermanentlySeen = (id: string) => {
    // Marcar como vista permanentemente (no se volverá a mostrar)
    persistNotifState({ ...notifState, [id]: { status: 'seen' } })
  }

  const clearSnoozedNotifications = () => {
    // Limpiar notificaciones que ya no aplican
    const now = new Date()
    const updatedState = { ...notifState }
    let hasChanges = false

    Object.entries(notifState).forEach(([id, state]) => {
      if (state.status === 'snoozed' && state.snoozeUntil) {
        const snoozeTime = new Date(state.snoozeUntil)
        if (now >= snoozeTime) {
          // Verificar si la notificación aún aplica
          const notification = notifications.find(n => n.id === id)
          if (notification) {
            // Si la notificación ya no aplica (ej: sorpresa ya abierta, tarea completada), marcarla como vista permanentemente
            const shouldStillShow = checkIfNotificationStillApplies(notification)
            if (!shouldStillShow) {
              updatedState[id] = { status: 'seen' }
              hasChanges = true
            }
            // Si aún aplica, se mantiene en snooze hasta la próxima verificación
          } else {
            // Si la notificación ya no existe en la lista actual, marcarla como vista permanentemente
            updatedState[id] = { status: 'seen' }
            hasChanges = true
          }
        }
      }
    })

    if (hasChanges) {
      persistNotifState(updatedState)
    }
  }

  const checkIfNotificationStillApplies = (notification: any): boolean => {
    // Verificar si la notificación aún es relevante basándose en su tipo
    switch (notification.kind) {
      case 'surprise_unlockable':
        // Verificar si las sorpresas aún están abribles
        return summary.surprisesUnlockableNow?.length > 0
      
      case 'surprise_upcoming':
        // Verificar si las sorpresas aún están próximas
        return summary.surprisesUpcomingSoon?.length > 0
      
      
      
      case 'task':
        // Verificar si la tarea aún está pendiente y próxima
        const taskId = notification.id.replace('task:', '')
        const task = notifications.find(n => n.id === `task:${taskId}`)
        if (!task) return false
        const taskDue = new Date(task.when)
        const tomorrowTask = new Date()
        tomorrowTask.setDate(tomorrowTask.getDate() + 1)
        return taskDue <= tomorrowTask
      
      case 'health':
        // Verificar si el registro de salud aún está próximo
        const healthId = notification.id.replace('health:', '')
        const health = notifications.find(n => n.id === `health:${healthId}`)
        if (!health) return false
        const healthDue = new Date(health.when)
        const weekAhead = new Date()
        weekAhead.setDate(weekAhead.getDate() + 7)
        return healthDue <= weekAhead
      
      case 'plan':
        // Verificar si el plan aún está próximo
        const planId = notification.id.replace('plan:', '')
        const plan = notifications.find(n => n.id === `plan:${planId}`)
        if (!plan) return false
        const planDate = new Date(plan.when)
        const weekAheadPlan = new Date()
        weekAheadPlan.setDate(weekAheadPlan.getDate() + 7)
        return planDate <= weekAheadPlan
      
             case 'place_pending':
         // Para lugares pendientes, siempre se puede volver a mostrar (el usuario puede cambiar el estado)
         return true
       
       case 'place_recent':
         // Para lugares con fecha de visita, verificar si la fecha aún es relevante
         // Esta verificación se hace en tiempo real, así que siempre puede volver a aparecer
         return true
       
       case 'message_unread':
         // Para mensajes sin leer, siempre se puede volver a mostrar (el usuario puede cambiar el estado)
         return true
       
               case 'recipe_suggestion':
          // Para sugerencias de recetas, verificar si la hora aún es apropiada
          const currentHour = new Date().getHours()
          const isMealTime = (currentHour >= 6 && currentHour < 11) || // Desayuno
                            (currentHour >= 11 && currentHour < 16) || // Almuerzo
                            (currentHour >= 16 && currentHour < 21)    // Cena
          return isMealTime
        
        case 'movie_pending':
          // Para películas pendientes, siempre se puede volver a mostrar (el usuario puede cambiar el estado)
          return true
        
        case 'movie_recommendation':
          // Para recomendaciones de películas, siempre se puede volver a mostrar
          return true
        
        case 'goal_deadline':
          // Para metas con fechas límite, verificar si la fecha aún es próxima
          const goalDeadline = new Date(notification.when)
          const nowMsGoal = new Date().getTime()
          const daysUntilDeadline = Math.ceil((goalDeadline.getTime() - nowMsGoal) / (24 * 60 * 60 * 1000))
          return daysUntilDeadline > 0 && daysUntilDeadline <= 30
        
        case 'goal_low_progress':
          // Para metas con progreso bajo, siempre se puede volver a mostrar
          return true
        
        case 'goal_completed':
          // Para metas completadas, solo mostrar por 7 días
          const goalCompletedDate = new Date(notification.when)
          const nowMsGoalCompleted = new Date().getTime()
          const daysSinceCompletion = Math.floor((nowMsGoalCompleted - goalCompletedDate.getTime()) / (24 * 60 * 60 * 1000))
          return daysSinceCompletion <= 7
        
        case 'dream_motivation':
          // Para motivación de sueños, siempre se puede volver a mostrar
          return true
        
        case 'dream_achieved':
          // Para sueños logrados, solo mostrar por 7 días
          const dreamAchievedDate = new Date(notification.when)
          const nowMsDream = new Date().getTime()
          const daysSinceAchievement = Math.floor((nowMsDream - dreamAchievedDate.getTime()) / (24 * 60 * 60 * 1000))
          return daysSinceAchievement <= 7
      
      default:
        // Para otros tipos, asumir que aún aplican
        return true
    }
  }

  const getIconForKind = (kind: string) => {
    switch (kind) {
      case 'task': return ClipboardCheck
      case 'health': return Activity
      case 'plan': return CalendarDays
      case 'surprise': return Gift
      case 'surprise_unlockable': return Gift
             case 'surprise_upcoming': return CalendarDays
       
                      case 'place_pending': return MapPin
         case 'place_recent': return Plus
        case 'message_unread': return Bell
       case 'recipe_suggestion': return ChefHat
             case 'movie_pending': return Film
      case 'movie_recommendation': return Film
     case 'goal_deadline': return Target
    case 'goal_low_progress': return Target
   case 'goal_completed': return Target
  case 'dream_motivation': return StarIcon
 case 'dream_achieved': return StarIcon
      default: return Sparkles
    }
  }

  const getIconColor = (kind: string) => {
    switch (kind) {
      case 'task': return 'from-rose-500 to-pink-500'
      case 'health': return 'from-emerald-500 to-teal-500'
      case 'plan': return 'from-blue-500 to-indigo-500'
      case 'surprise': return 'from-purple-500 to-fuchsia-500'
      case 'surprise_unlockable': return 'from-green-500 to-emerald-500'
      case 'surprise_upcoming': return 'from-blue-500 to-indigo-500'
      
                                                       case 'place_pending': return 'from-blue-500 to-indigo-500'
         case 'place_recent': return 'from-green-500 to-emerald-500'
        case 'message_unread': return 'from-purple-500 to-violet-500'
       case 'recipe_suggestion': return 'from-orange-500 to-red-500'
             case 'movie_pending': return 'from-indigo-500 to-purple-500'
      case 'movie_recommendation': return 'from-blue-500 to-cyan-500'
     case 'goal_deadline': return 'from-red-500 to-orange-500'
    case 'goal_low_progress': return 'from-yellow-500 to-orange-500'
   case 'goal_completed': return 'from-green-500 to-emerald-500'
  case 'dream_motivation': return 'from-purple-500 to-pink-500'
 case 'dream_achieved': return 'from-pink-500 to-rose-500'
      default: return 'from-pink-500 to-fuchsia-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-0 border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white p-6 rounded-t-lg">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="leading-tight text-white text-2xl font-bold">Notificaciones</DialogTitle>
                <DialogDescription className="text-pink-100">Todo lo que necesitas saber en un vistazo</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {hasAlerts && (
                  <motion.span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Tienes pendientes</span>
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Botón para permisos de notificación */}
              {isSupported && permission !== 'granted' && (
                <motion.button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white shadow-lg hover:bg-white/30 transition-all duration-300"
                  onClick={requestPermission}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Activar notificaciones del navegador"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Activar</span>
                </motion.button>
              )}
              
              {/* Indicador de notificaciones activas */}
              {isSupported && permission === 'granted' && (
                <motion.span 
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-green-500/20 backdrop-blur-sm text-green-100 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  title="Notificaciones del navegador activas"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Activas</span>
                </motion.span>
              )}
            </div>
          </motion.div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <AnimatePresence>
            {lastUpdated && (
              <motion.p 
                className="text-xs text-pink-600 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                ✨ Actualizado: {lastUpdated.toLocaleString()}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Lista unificada de notificaciones */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-pink-200/50 overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {visibleNotifications.length === 0 ? (
              <motion.div 
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-100 to-fuchsia-100 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-pink-400" />
                </motion.div>
                <p className="text-gray-500 font-medium">¡Todo en orden!</p>
                <p className="text-gray-400 text-sm">No hay notificaciones pendientes</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-pink-100">
                <AnimatePresence>
                  {visibleNotifications.map((item, index) => {
                    const Icon = getIconForKind(item.kind)
                    const iconColor = getIconColor(item.kind)
                    return (
                      <motion.div 
                        key={item.id} 
                        className="p-4 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-fuchsia-50/50 transition-all duration-300 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        layout
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <motion.div 
                              className={`mt-1 h-8 w-8 rounded-full bg-gradient-to-r ${iconColor} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                            <div className="min-w-0 flex-1">
                              <motion.p 
                                className="m-0 font-semibold text-gray-900 text-lg group-hover:text-pink-700 transition-colors duration-300"
                                layout
                              >
                                {item.title}
                              </motion.p>
                              {item.desc && (
                                <motion.p 
                                  className="m-0 text-sm text-gray-600 mt-1 line-clamp-2"
                                  layout
                                >
                                  {item.desc}
                                </motion.p>
                              )}
                              {item.when && (
                                <motion.p 
                                  className="m-0 mt-2 text-xs text-pink-500 font-medium flex items-center gap-1"
                                  layout
                                >
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(item.when).toLocaleString()}
                                </motion.p>
                              )}
                            </div>
                          </div>
                          <motion.div 
                            className="shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                                                         <button 
                               className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                               onClick={() => markAsSeen(item.id)}
                               title="Ocultar por 10 minutos. Se volverá a mostrar si aún es relevante (sorpresa no abierta, lugar no visitado, etc.)"
                             >
                               Ya vi
                             </button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          
        </div>
      </DialogContent>
    </Dialog>
  )
}


