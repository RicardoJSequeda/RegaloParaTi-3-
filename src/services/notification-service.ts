'use client'

import { getBrowserClient } from '@/lib/supabase/browser-client'
import { Section } from '@/types'

interface NotificationConfig {
  section: Section
  title: string
  body: string
  icon?: string
}

class NotificationService {
  private supabase = getBrowserClient()
  private subscriptions: Array<{ unsubscribe: () => void }> = []
  private checkInterval: NodeJS.Timeout | null = null
  private lastCheckTime: Date = new Date()

  // Iniciar el servicio de notificaciones
  async start(onNavigate?: (section: Section) => void) {
    // Verificar permisos primero
    if ('Notification' in window && Notification.permission === 'granted') {
      // Iniciar monitoreo de cambios en tiempo real
      this.setupRealtimeSubscriptions()
      
      // Iniciar verificación periódica
      this.startPeriodicChecks()
    }
  }

  // Configurar suscripciones en tiempo real
  private setupRealtimeSubscriptions() {
    // Suscripción a tareas de mascotas pendientes
    const petTasksSub = this.supabase
      .channel('pet_tasks_notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'pet_tasks', filter: 'status=eq.pendiente' },
        (payload) => {
          this.sendNotification({
            section: 'mascotas',
            title: 'Nueva tarea de mascota',
            body: `Tienes una nueva tarea pendiente: ${payload.new.title || 'Sin título'}`,
            icon: '/favicon.ico'
          })
        }
      )
      .subscribe()

    this.subscriptions.push({ unsubscribe: () => petTasksSub.unsubscribe() })

    // Suscripción a planes próximos
    const plansSub = this.supabase
      .channel('plans_notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'plans' },
        (payload) => {
          const plan = payload.new as any
          const planDate = new Date(plan.date)
          const now = new Date()
          const hoursUntil = (planDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          
          // Notificar si el plan es en las próximas 24 horas
          if (hoursUntil <= 24 && hoursUntil > 0) {
            this.sendNotification({
              section: 'planes',
              title: 'Plan próximo',
              body: `Tienes un plan pronto: ${plan.title || 'Sin título'}`,
              icon: '/favicon.ico'
            })
          }
        }
      )
      .subscribe()

    this.subscriptions.push({ unsubscribe: () => plansSub.unsubscribe() })

    // Suscripción a mensajes no leídos
    const messagesSub = this.supabase
      .channel('messages_notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'is_read=eq.false' },
        (payload) => {
          this.sendNotification({
            section: 'mensajes',
            title: 'Nuevo mensaje',
            body: `Tienes un nuevo mensaje de ${payload.new.sender || 'alguien'}`,
            icon: '/favicon.ico'
          })
        }
      )
      .subscribe()

    this.subscriptions.push({ unsubscribe: () => messagesSub.unsubscribe() })
  }

  // Verificación periódica de eventos
  private startPeriodicChecks() {
    // Verificar cada 5 minutos
    this.checkInterval = setInterval(async () => {
      await this.checkPendingNotifications()
    }, 5 * 60 * 1000)

    // Verificar inmediatamente
    this.checkPendingNotifications()
  }

  // Verificar notificaciones pendientes
  private async checkPendingNotifications() {
    try {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)

      // Verificar planes próximos (próximas 24 horas)
      const { data: upcomingPlans } = await this.supabase
        .from('plans')
        .select('*')
        .gte('date', now.toISOString().split('T')[0])
        .lte('date', tomorrow.toISOString().split('T')[0])
        .eq('status', 'pendiente')
        .order('date', { ascending: true })
        .limit(5)

      if (upcomingPlans && upcomingPlans.length > 0) {
        const nextPlan = upcomingPlans[0]
        const planDate = new Date(nextPlan.date)
        const hoursUntil = (planDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        // Notificar si es en las próximas 2 horas
        if (hoursUntil <= 2 && hoursUntil > 0) {
          this.sendNotification({
            section: 'planes',
            title: 'Recordatorio de plan',
            body: `Tu plan "${nextPlan.title}" es en ${Math.round(hoursUntil * 60)} minutos`,
            icon: '/favicon.ico'
          })
        }
      }

      // Verificar tareas de mascotas vencidas o próximas
      const { data: petTasks } = await this.supabase
        .from('pet_tasks')
        .select('*')
        .eq('status', 'pendiente')
        .lte('next_due', tomorrow.toISOString())
        .order('next_due', { ascending: true })
        .limit(5)

      if (petTasks && petTasks.length > 0) {
        const nextTask = petTasks[0]
        const taskDate = new Date(nextTask.next_due)
        const hoursUntil = (taskDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        // Notificar si la tarea es en las próximas 2 horas o está vencida
        if (hoursUntil <= 2) {
          this.sendNotification({
            section: 'mascotas',
            title: hoursUntil < 0 ? 'Tarea vencida' : 'Tarea próxima',
            body: `${nextTask.title} - ${hoursUntil < 0 ? 'Vencida' : `En ${Math.round(Math.abs(hoursUntil) * 60)} minutos`}`,
            icon: '/favicon.ico'
          })
        }
      }

      // Verificar mensajes no leídos
      const { data: unreadMessages } = await this.supabase
        .from('messages')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1)

      if (unreadMessages && unreadMessages.length > 0) {
        const message = unreadMessages[0]
        // Solo notificar si el mensaje es reciente (últimos 5 minutos)
        const messageDate = new Date(message.created_at)
        const minutesSince = (now.getTime() - messageDate.getTime()) / (1000 * 60)
        
        if (minutesSince <= 5) {
          this.sendNotification({
            section: 'mensajes',
            title: 'Nuevo mensaje',
            body: `Tienes un nuevo mensaje${message.sender ? ` de ${message.sender}` : ''}`,
            icon: '/favicon.ico'
          })
        }
      }

      this.lastCheckTime = now
    } catch (error) {
      console.error('Error al verificar notificaciones:', error)
    }
  }

  // Enviar notificación
  private sendNotification(config: NotificationConfig) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission !== 'granted') {
      return
    }

    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon || '/favicon.ico',
        badge: '/favicon.ico',
        data: {
          section: config.section
        },
        tag: `notification_${config.section}_${Date.now()}`,
        requireInteraction: false,
        silent: false
      })

      // Manejar click en la notificación
      notification.onclick = (event) => {
        event.preventDefault()
        
        // Disparar evento personalizado para que el Dashboard lo maneje
        const customEvent = new CustomEvent('notificationclick', {
          detail: { section: config.section }
        })
        window.dispatchEvent(customEvent)
        
        // Enfocar la ventana
        window.focus()
        
        // Cerrar la notificación
        notification.close()
      }

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error) {
      console.error('Error al enviar notificación:', error)
    }
  }

  // Detener el servicio
  stop() {
    // Cancelar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe())
    this.subscriptions = []

    // Cancelar verificación periódica
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
}

// Instancia singleton
export const notificationService = new NotificationService()

