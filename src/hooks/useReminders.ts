'use client'

import { useEffect, useRef } from 'react'
import { Plan } from '@/types'

export function useReminders(plans: Plan[]) {
  const notificationPermission = useRef<NotificationPermission>('default')

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermission.current = permission
        })
      } else {
        notificationPermission.current = Notification.permission
      }
    }
  }, [])

  // Check for upcoming plans and send notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      
      plans.forEach(plan => {
        if (plan.status === 'cancelado') return
        
        const planDate = new Date(plan.date + (plan.time ? `T${plan.time}` : 'T00:00'))
        
        // Check if it's time to send the reminder (1 hour before)
        const reminderDate = new Date(planDate.getTime() - (60 * 60 * 1000))
        
        // Check if it's time to send the reminder
        if (now >= reminderDate && now <= planDate) {
          sendNotification(plan)
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkReminders, 60000)
    checkReminders() // Initial check

    return () => clearInterval(interval)
  }, [plans])

  const parseReminderTime = (timeString: string): number => {
    const value = parseInt(timeString.slice(0, -1))
    const unit = timeString.slice(-1)
    
    switch (unit) {
      case 'm': return value * 60 * 1000 // minutes
      case 'h': return value * 60 * 60 * 1000 // hours
      case 'd': return value * 24 * 60 * 60 * 1000 // days
      default: return 60 * 60 * 1000 // default 1 hour
    }
  }

  const sendNotification = (plan: Plan) => {
    if (notificationPermission.current !== 'granted') return

    const title = `¡Recordatorio de Plan!`
    const body = `${plan.title} - ${new Date(plan.date).toLocaleDateString('es-ES')}`
    
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `plan-${plan.id}`,
      requireInteraction: true
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }


  }

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones')
      return false
    }

    const permission = await Notification.requestPermission()
    notificationPermission.current = permission
    return permission === 'granted'
  }

  const isNotificationSupported = () => {
    return 'Notification' in window
  }

  const getNotificationPermission = () => {
    return notificationPermission.current
  }

  return {
    requestNotificationPermission,
    isNotificationSupported,
    getNotificationPermission
  }
}
