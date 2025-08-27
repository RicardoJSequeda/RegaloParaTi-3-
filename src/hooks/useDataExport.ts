import { useCallback } from 'react'

export function useDataExport() {
  const exportAllData = useCallback(() => {
    try {
      const allData: Record<string, any> = {}
      
      // Obtener todas las claves de localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              allData[key] = JSON.parse(value)
            } catch {
              allData[key] = value
            }
          }
        }
      }

      // Crear archivo de backup
      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `amor-app-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return { success: true, message: 'Backup exportado exitosamente' }
    } catch (error) {
      console.error('Error al exportar datos:', error)
      return { success: false, message: 'Error al exportar datos' }
    }
  }, [])

  const importAllData = useCallback((file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)
          
          // Restaurar todos los datos
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]))
          })

          // Recargar la página para aplicar los cambios
          window.location.reload()
          
          resolve({ success: true, message: 'Datos importados exitosamente' })
        } catch (error) {
          console.error('Error al importar datos:', error)
          resolve({ success: false, message: 'Error al importar datos' })
        }
      }

      reader.onerror = () => {
        resolve({ success: false, message: 'Error al leer el archivo' })
      }

      reader.readAsText(file)
    })
  }, [])

  const clearAllData = useCallback(() => {
    try {
      localStorage.clear()
      window.location.reload()
      return { success: true, message: 'Todos los datos han sido eliminados' }
    } catch (error) {
      console.error('Error al limpiar datos:', error)
      return { success: false, message: 'Error al limpiar datos' }
    }
  }, [])

  const getStorageInfo = useCallback(() => {
    try {
      const info: Record<string, any> = {}
      let totalSize = 0
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            const size = new Blob([value]).size
            totalSize += size
            info[key] = {
              size: size,
              sizeFormatted: formatBytes(size),
              itemCount: Array.isArray(JSON.parse(value)) ? JSON.parse(value).length : 1
            }
          }
        }
      }

      return {
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        keys: Object.keys(info),
        details: info
      }
    } catch (error) {
      console.error('Error al obtener información del storage:', error)
      return null
    }
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    exportAllData,
    importAllData,
    clearAllData,
    getStorageInfo
  }
}
