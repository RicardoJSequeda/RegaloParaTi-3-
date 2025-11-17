import { useState, useEffect, useCallback } from 'react'
import { Section } from '@/types'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    section?: Section
    [key: string]: any
  }
  requireInteraction?: boolean
  silent?: boolean
  onClick?: (section?: Section) => void
}

type NotificationClickHandler = (section?: Section) => void

// Almacenar el handler global para clicks de notificaciones
let globalNotificationClickHandler: NotificationClickHandler | null = null

export function setNotificationClickHandler(handler: NotificationClickHandler) {
  globalNotificationClickHandler = handler
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    if ('Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }

    // Escuchar clicks en notificaciones
    const handleNotificationClick = (event: Event) => {
      const notification = event.target as Notification
      const data = notification.data
      
      if (globalNotificationClickHandler && data?.section) {
        globalNotificationClickHandler(data.section)
      }
      
      // Cerrar la notificación después de hacer click
      notification.close()
    }

    // Agregar listener para clicks (cuando la app está en primer plano)
    window.addEventListener('notificationclick', handleNotificationClick as EventListener)

    return () => {
      window.removeEventListener('notificationclick', handleNotificationClick as EventListener)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Las notificaciones no están soportadas en este navegador')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error)
      return false
    }
  }

  const sendNotification = useCallback((options: NotificationOptions): Notification | null => {
    if (!isSupported || permission !== 'granted') {
      console.warn('No se pueden enviar notificaciones: permisos no otorgados')
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      })

      // Manejar click en la notificación
      notification.onclick = (event) => {
        event.preventDefault()
        
        // Si hay un handler específico, usarlo
        if (options.onClick) {
          options.onClick(options.data?.section)
        } else if (globalNotificationClickHandler && options.data?.section) {
          // Usar el handler global
          globalNotificationClickHandler(options.data.section)
        }
        
        // Enfocar la ventana si está en segundo plano
        window.focus()
        
        // Cerrar la notificación
        notification.close()
      }

      // Auto-cerrar la notificación después de 5 segundos si no requiere interacción
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Error al enviar notificación:', error)
      return null
    }
  }, [isSupported, permission])

  const scheduleNotification = (
    options: NotificationOptions,
    delay: number // delay en milisegundos
  ): NodeJS.Timeout | null => {
    if (!isSupported || permission !== 'granted') {
      return null
    }

    return setTimeout(() => {
      sendNotification(options)
    }, delay)
  }

  const cancelScheduledNotification = (timeoutId: NodeJS.Timeout) => {
    clearTimeout(timeoutId)
  }

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification,
    cancelScheduledNotification
  }
}
