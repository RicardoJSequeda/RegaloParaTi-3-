import { useState, useEffect } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
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

  const sendNotification = (options: NotificationOptions): boolean => {
    if (!isSupported || permission !== 'granted') {
      console.warn('No se pueden enviar notificaciones: permisos no otorgados')
      return false
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      })

      // Auto-cerrar la notificación después de 5 segundos
      setTimeout(() => {
        notification.close()
      }, 5000)

      return true
    } catch (error) {
      console.error('Error al enviar notificación:', error)
      return false
    }
  }

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
