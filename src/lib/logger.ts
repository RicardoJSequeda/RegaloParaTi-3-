/**
 * Sistema de logging para la aplicación
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  error?: Error
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    let formatted = `${prefix} ${message}`
    
    if (data) {
      formatted += `\nData: ${JSON.stringify(data, null, 2)}`
    }
    
    if (error) {
      formatted += `\nError: ${error.message}`
      if (error.stack && this.isDevelopment) {
        formatted += `\nStack: ${error.stack}`
      }
    }
    
    return formatted
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    const formatted = this.formatMessage(level, message, data, error)

    switch (level) {
      case 'error':
        console.error(formatted)
        // En producción, podrías enviar a un servicio de logging como Sentry
        if (this.isProduction && error) {
          // TODO: Integrar con servicio de logging en producción
          // Sentry.captureException(error)
        }
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted)
        }
        break
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error, data?: any): void {
    this.log('error', message, data, error)
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  // Métodos específicos para diferentes contextos
  api(method: string, path: string, statusCode: number, duration?: number): void {
    const message = `${method} ${path} - ${statusCode}${duration ? ` (${duration}ms)` : ''}`
    if (statusCode >= 500) {
      this.error(message)
    } else if (statusCode >= 400) {
      this.warn(message)
    } else {
      this.info(message)
    }
  }

  database(operation: string, error?: Error, data?: any): void {
    if (error) {
      this.error(`Database operation failed: ${operation}`, error, data)
    } else {
      this.debug(`Database operation: ${operation}`, data)
    }
  }

  validation(field: string, error: string): void {
    this.warn(`Validation error in ${field}: ${error}`)
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Exportar clase para testing
export { Logger }

