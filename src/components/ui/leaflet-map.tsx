'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPlace } from '@/types'
import { Button } from './button'
import { Input } from './input'
import { Search, MapPin, Plus, Navigation, X, MousePointer, Heart, Star, MapPin as MapPinIcon } from 'lucide-react'

interface LeafletMapProps {
  places: MapPlace[]
  className?: string
  onAddPlace?: (place: Omit<MapPlace, 'id'>) => void
}

declare global {
  interface Window {
    L: any
  }
}

// @ts-ignore - onAddPlace function prop is expected for client component
export function LeafletMap({ places, className = "h-[600px] w-full", onAddPlace }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string, type: string} | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isAddingPlace, setIsAddingPlace] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(true)
  const [locationWatcher, setLocationWatcher] = useState<number | null>(null)
  const [currentCity, setCurrentCity] = useState<string>('')
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{name: string, address: string, lat: number, lng: number, type?: string}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Coordenadas por defecto (centro de Colombia)
  const defaultCenter = { lat: 4.5709, lng: -74.2973 }

  // Función para crear íconos personalizados
  const createCustomIcon = (type: 'user' | 'visited' | 'pending' | 'search' | 'favorite' = 'pending') => {
    if (typeof window === 'undefined') return null
    const L = window.L
    if (!L) return null

    const iconConfigs = {
      user: {
        html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">📍</div>`,
        className: 'custom-user-icon'
      },
      visited: {
        html: `<div style="background-color: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">✅</div>`,
        className: 'custom-visited-icon'
      },
      pending: {
        html: `<div style="background-color: #f59e0b; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">⭐</div>`,
        className: 'custom-pending-icon'
      },
      search: {
        html: `<div style="background-color: #ef4444; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">🔍</div>`,
        className: 'custom-search-icon'
      },
      favorite: {
        html: `<div style="background-color: #ec4899; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">💖</div>`,
        className: 'custom-favorite-icon'
      }
    }

    const config = iconConfigs[type]
    return L.divIcon({
      className: config.className,
      html: config.html,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }

  // Función para validar coordenadas
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return typeof lat === 'number' && typeof lng === 'number' && 
           isFinite(lat) && isFinite(lng) &&
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180
  }

  // Función para obtener el nombre de la ciudad desde coordenadas
  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    if (!isValidCoordinate(lat, lng)) {
      console.log('⚠️ Coordenadas inválidas para getCityFromCoordinates:', { lat, lng })
      return 'Ubicación desconocida'
    }

    try {
      console.log('🔍 Obteniendo información de ciudad para:', lat, lng)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📋 Datos de geocoding recibidos:', data)
      
      if (data && data.address) {
        // Para Colombia, intentar obtener el nombre más específico
        const cityName = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.municipality ||
                        data.address.county ||
                        data.address.state ||
                        data.address.country ||
                        data.display_name.split(',')[0]
        
        const result = cityName || 'Ubicación desconocida'
        console.log('🏙️ Ciudad detectada:', result)
        return result
      }
      
      // Si no hay address, usar display_name
      if (data && data.display_name) {
        const parts = data.display_name.split(',')
        const result = parts[0] || 'Ubicación desconocida'
        console.log('🏙️ Ciudad desde display_name:', result)
        return result
      }
      
      console.log('⚠️ No se pudo obtener información de ciudad')
      return 'Ubicación desconocida'
    } catch (error) {
      console.error('❌ Error obteniendo nombre de ciudad:', error)
      return 'Ubicación desconocida'
    }
  }

  useEffect(() => {
    // Cargar Leaflet desde CDN de manera más robusta
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        // Verificar si Leaflet ya está cargado
        if (window.L) {
          console.log('✅ Leaflet ya está cargado')
          initializeMap()
          return
        }

        console.log('🔄 Cargando Leaflet...')

        // Cargar CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
          console.log('✅ CSS de Leaflet cargado')
        }

        // Cargar JS
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
          script.crossOrigin = ''
          
          script.onload = () => {
            console.log('✅ JavaScript de Leaflet cargado')
            // Esperar un poco para asegurar que Leaflet esté completamente inicializado
            setTimeout(() => {
              initializeMap()
              resolve()
            }, 100)
          }
          
          script.onerror = () => {
            console.error('❌ Error cargando Leaflet')
            reject(new Error('Error cargando Leaflet'))
          }
          
          document.head.appendChild(script)
        })
      }
    }

    loadLeaflet().catch(error => {
      console.error('Error en loadLeaflet:', error)
      setIsGettingLocation(false)
      setCurrentCity('Error cargando mapa')
    })

    // Limpiar watcher cuando el componente se desmonte
    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher)
      }
    }
  }, [])

  // Evento para cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.L) {
      console.log('❌ No se puede inicializar el mapa: mapRef o window.L no disponible')
      return
    }

    console.log('🗺️ Inicializando mapa...')

    // Obtener ubicación del usuario con alta precisión
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }

      console.log('📍 Solicitando ubicación del usuario...')
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          // Validar que las coordenadas sean números válidos
          if (!isValidCoordinate(userPos.lat, userPos.lng)) {
            console.log('❌ Coordenadas inválidas obtenidas:', userPos)
            setIsGettingLocation(false)
            setCurrentCity('Error en ubicación')
            createMap(defaultCenter.lat, defaultCenter.lng)
            return
          }
          
          console.log('✅ Ubicación obtenida exitosamente:', userPos)
          setUserLocation(userPos)
          
          // Obtener nombre de la ciudad
          try {
            const cityName = await getCityFromCoordinates(userPos.lat, userPos.lng)
            setCurrentCity(cityName)
            console.log('🏙️ Ciudad detectada:', cityName)
          } catch (error) {
            console.log('⚠️ Error obteniendo nombre de ciudad:', error)
            setCurrentCity('Ubicación detectada')
          }
          
          setIsGettingLocation(false)
          createMap(userPos.lat, userPos.lng)
          
          // Iniciar seguimiento de ubicación en tiempo real
          startLocationTracking()
        },
        (error) => {
          console.log('❌ Error obteniendo ubicación:', error)
          console.log('Código de error:', error.code)
          console.log('Mensaje:', error.message)
          
          // Mostrar mensaje específico según el tipo de error
          let errorMessage = 'Error desconocido'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible'
              break
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado'
              break
          }
          console.log('Mensaje de error:', errorMessage)
          
          setIsGettingLocation(false)
          setCurrentCity('Ubicación no disponible')
          createMap(defaultCenter.lat, defaultCenter.lng)
        },
        options
      )
    } else {
      console.log('❌ Geolocalización no soportada')
      setIsGettingLocation(false)
      setCurrentCity('Geolocalización no disponible')
      createMap(defaultCenter.lat, defaultCenter.lng)
    }
  }

  const createMap = (lat: number, lng: number) => {
    // Validar que las coordenadas sean números válidos
    if (!isValidCoordinate(lat, lng) || !mapRef.current || !window.L) {
      console.log('⚠️ Coordenadas inválidas para createMap:', { lat, lng })
      return
    }

    const L = window.L
    console.log('🗺️ Creando mapa en:', lat, lng)

    // Verificar si el mapa ya está inicializado
    if (mapInstanceRef.current) {
      console.log('🗺️ Removiendo mapa anterior...')
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      // Crear mapa
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      })

      console.log('🗺️ Mapa creado exitosamente')

      // Agregar capa de tiles con múltiples proveedores como fallback
      const tileLayers = [
        {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        {
          url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        },
        {
          url: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      ]

      // Intentar cargar el primer proveedor de tiles
      let tileLayerAdded = false
      for (let i = 0; i < tileLayers.length && !tileLayerAdded; i++) {
        try {
          const tileLayer = L.tileLayer(tileLayers[i].url, {
            attribution: tileLayers[i].attribution,
            maxZoom: 19,
            subdomains: 'abc'
          })
          
          tileLayer.addTo(map)
          tileLayerAdded = true
          console.log(`✅ Capa de tiles ${i + 1} agregada exitosamente`)
          
          // Verificar que los tiles se cargan correctamente
          tileLayer.on('tileloadstart', () => {
            console.log('🔄 Cargando tile...')
          })
          
          tileLayer.on('tileload', () => {
            console.log('✅ Tile cargado exitosamente')
          })
          
          tileLayer.on('tileerror', (error: any) => {
            console.error('❌ Error cargando tile:', error)
          })
        } catch (error) {
          console.error(`❌ Error agregando capa de tiles ${i + 1}:`, error)
        }
      }

      if (!tileLayerAdded) {
        console.error('❌ No se pudo agregar ninguna capa de tiles')
        // Agregar un fondo de color como fallback
        map.getContainer().style.backgroundColor = '#e5e7eb'
      }

      // Agregar marcador de ubicación del usuario usando ícono personalizado
      const userIcon = createCustomIcon('user')
      if (userIcon) {
        const userMarker = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<b>📍 Mi ubicación actual</b><br>${currentCity || 'Detectando ciudad...'}`)
          .openPopup()
        
        console.log('✅ Marcador de usuario agregado')
      }

      // Agregar círculo de radio alrededor de la ubicación del usuario
      L.circle([lat, lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 1000 // 1km de radio
      }).addTo(map)

      // Agregar marcadores de lugares existentes con íconos personalizados
      places.forEach((place) => {
        if (isValidCoordinate(place.lat, place.lng)) {
          const iconType = place.visited ? 'visited' : 'pending'
          const icon = createCustomIcon(iconType)
          
          if (icon) {
            const marker = L.marker([place.lat, place.lng], { icon })
              .addTo(map)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 8px; color: #374151;">${place.name}</h3>
                  <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${place.address}</p>
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; background-color: ${place.visited ? '#d1fae5' : '#fef3c7'}; color: ${place.visited ? '#065f46' : '#92400e'};">
                    ${place.visited ? '✅ Visitado' : '⭐ Pendiente'}
                  </span>
                </div>
              `)

            markersRef.current.push(marker)
          }
        }
      })

      mapInstanceRef.current = map
      setIsMapLoaded(true)
      console.log('✅ Mapa inicializado completamente')

             // Forzar un refresh del mapa después de un breve delay
       setTimeout(() => {
         if (mapInstanceRef.current) {
           mapInstanceRef.current.invalidateSize()
           console.log('🔄 Tamaño del mapa actualizado')
         }
       }, 500)

       // Agregar evento de clic en el mapa para agregar lugares manualmente
       map.on('click', (e: any) => {
         if (isAddingPlace) {
           const clickLat = e.latlng.lat
           const clickLng = e.latlng.lng
           
           if (isValidCoordinate(clickLat, clickLng)) {
             // Obtener información del lugar usando reverse geocoding
             fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}&addressdetails=1`)
               .then(response => response.json())
               .then(data => {
                 const name = data.display_name.split(',')[0]
                 const address = data.display_name
                 
                 // Agregar marcador temporal
                 const tempIcon = createCustomIcon('search')
                 
                 if (tempIcon) {
                   const tempMarker = L.marker([clickLat, clickLng], { icon: tempIcon })
                     .addTo(map)
                     .bindPopup(`
                       <div style="min-width: 250px;">
                         <h3 style="font-weight: bold; margin-bottom: 8px; color: #374151;">${name}</h3>
                         <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${address}</p>
                         <div style="display: flex; gap: 4px;">
                           <button onclick="window.addPlaceFromMap('${name}', '${address}', ${clickLat}, ${clickLng}, 'lugar')" style="background-color: #ec4899; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; flex: 1;">
                             💖 Lugar Especial
                           </button>
                           <button onclick="window.addPlaceFromMap('${name}', '${address}', ${clickLat}, ${clickLng}, 'evento')" style="background-color: #8b5cf6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; flex: 1;">
                             🎉 Evento
                           </button>
                         </div>
                       </div>
                     `)
                     .openPopup()

                   // Exponer función global
                   ;(window as any).addPlaceFromMap = (name: string, address: string, lat: number, lng: number, type: string) => {
                     if (onAddPlace) {
                       onAddPlace({
                         name: name,
                         address: address,
                         lat: lat,
                         lng: lng,
                         type: type === 'evento' ? 'eventos' : 'otro',
                         visited: false
                       })
                       map.removeLayer(tempMarker)
                       setIsAddingPlace(false)
                     }
                   }
                 }
               })
               .catch(error => {
                 console.error('Error en reverse geocoding:', error)
               })
           }
         }
       })

     } catch (error) {
       console.error('❌ Error creando mapa:', error)
       setIsMapLoaded(false)
     }
   }

  // Función para obtener sugerencias de búsqueda usando Nominatim
  const getSearchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      console.log('🔍 Buscando con Nominatim:', query)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=es`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const results = await response.json()
      console.log('📋 Resultados obtenidos:', results)
      
      if (!results || !Array.isArray(results)) {
        console.log('⚠️ No se obtuvieron resultados válidos')
        setSearchSuggestions([])
        setShowSuggestions(false)
        return
      }
      
      const suggestions = results.slice(0, 5).map((result: any) => {
        if (!result || !result.display_name || typeof result.lat === 'undefined' || typeof result.lon === 'undefined') {
          console.log('⚠️ Resultado inválido:', result)
          return null
        }
        
        return {
          name: result.display_name.split(',')[0],
          address: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          type: 'search'
        }
      }).filter(Boolean) // Filtrar resultados nulos
      
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
      console.log('✅ Sugerencias procesadas:', suggestions)
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error)
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Función para manejar cambios en la búsqueda
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Obtener sugerencias con debounce
    const timeoutId = setTimeout(() => {
      getSearchSuggestions(value)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }

  // Función para seleccionar una sugerencia
  const selectSuggestion = (suggestion: {name: string, address: string, lat: number, lng: number, type?: string}) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    setSearchSuggestions([])
    
    // Centrar mapa en la sugerencia seleccionada
    if (mapInstanceRef.current && isValidCoordinate(suggestion.lat, suggestion.lng)) {
      try {
        mapInstanceRef.current.setView([suggestion.lat, suggestion.lng], 15)
        
        // Agregar marcador temporal con ícono personalizado
        const L = window.L
        const tempIcon = createCustomIcon('search')
        
        if (tempIcon) {
          const tempMarker = L.marker([suggestion.lat, suggestion.lng], { icon: tempIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="min-width: 250px;">
                <h3 style="font-weight: bold; margin-bottom: 8px; color: #374151;">${suggestion.name}</h3>
                <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${suggestion.address}</p>
                <div style="display: flex; gap: 4px;">
                  <button onclick="window.addPlaceFromMap('${suggestion.name}', '${suggestion.address}', ${suggestion.lat}, ${suggestion.lng}, 'lugar')" style="background-color: #ec4899; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; flex: 1;">
                    💖 Lugar Especial
                  </button>
                  <button onclick="window.addPlaceFromMap('${suggestion.name}', '${suggestion.address}', ${suggestion.lat}, ${suggestion.lng}, 'evento')" style="background-color: #8b5cf6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; flex: 1;">
                    🎉 Evento
                  </button>
                </div>
              </div>
            `)
            .openPopup()

          // Exponer función global
          ;(window as any).addPlaceFromMap = (name: string, address: string, lat: number, lng: number, type: string) => {
            if (onAddPlace) {
              onAddPlace({
                name: name,
                address: address,
                lat: lat,
                lng: lng,
                type: type === 'evento' ? 'eventos' : 'otro',
                visited: false
              })
              mapInstanceRef.current.removeLayer(tempMarker)
            }
          }
        }
      } catch (error) {
        console.log('Error al seleccionar sugerencia:', error)
      }
    } else {
      console.log('⚠️ Coordenadas inválidas en sugerencia:', suggestion)
    }
  }

  const centerOnUserLocation = () => {
    if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng) && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15)
        setSelectedLocation(null)
        setIsAddingPlace(false)
        
        // Limpiar marcadores temporales
        markersRef.current.forEach(marker => {
          try {
            if (marker && marker._icon && marker._icon.innerHTML && marker._icon.innerHTML.includes('ef4444')) {
              mapInstanceRef.current.removeLayer(marker)
            }
          } catch (error) {
            console.log('Error al limpiar marcador en centerOnUserLocation:', error)
          }
        })
      } catch (error) {
        console.log('Error al centrar en ubicación del usuario:', error)
      }
    } else {
      console.log('⚠️ No se puede centrar: Ubicación del usuario inválida o mapa no inicializado.', userLocation)
    }
  }

  // Función para iniciar seguimiento de ubicación en tiempo real
  const startLocationTracking = () => {
    if (navigator.geolocation && !locationWatcher) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          // Validar que las coordenadas sean números válidos
          if (!isValidCoordinate(newPos.lat, newPos.lng)) {
            console.log('❌ Coordenadas inválidas en watchPosition:', newPos)
            return
          }
          
          console.log('📍 Ubicación actualizada:', newPos)
          setUserLocation(newPos)
          
          // Obtener nuevo nombre de ciudad si cambió significativamente
          try {
            const newCityName = await getCityFromCoordinates(newPos.lat, newPos.lng)
            if (newCityName !== currentCity) {
              setCurrentCity(newCityName)
              console.log('🏙️ Nueva ciudad detectada:', newCityName)
            }
          } catch (error) {
            console.log('Error obteniendo nueva ciudad:', error)
          }
          
          // Actualizar marcador en el mapa si existe
          if (mapInstanceRef.current) {
            updateUserLocationMarker(newPos.lat, newPos.lng)
          }
        },
        (error) => {
          console.log('Error en seguimiento de ubicación:', error)
        },
        options
      )
      
      setLocationWatcher(watchId)
    }
  }

  // Función para actualizar el marcador de ubicación del usuario
  const updateUserLocationMarker = (lat: number, lng: number) => {
    // Validar que las coordenadas sean números válidos
    if (!isValidCoordinate(lat, lng) || !mapInstanceRef.current || !window.L) {
      console.log('⚠️ Coordenadas inválidas para updateUserLocationMarker:', { lat, lng })
      return
    }

    const L = window.L
    
    // Remover marcador anterior si existe
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        try {
          if (marker && marker._icon && marker._icon.innerHTML && marker._icon.innerHTML.includes('#3b82f6')) {
            mapInstanceRef.current.removeLayer(marker)
          }
        } catch (error) {
          console.log('Error al procesar marcador:', error)
        }
      })
    }

    // Crear nuevo marcador con ícono personalizado
    const userIcon = createCustomIcon('user')
    
    if (userIcon) {
      const newUserMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>📍 Mi ubicación actual</b><br>${currentCity || 'Detectando ciudad...'}`)

      // Actualizar círculo de radio
      L.circle([lat, lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 1000 // 1km de radio
      }).addTo(mapInstanceRef.current)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedLocation(null)
    setIsAddingPlace(false)
    setSearchSuggestions([])
    setShowSuggestions(false)
    
    // Limpiar marcadores temporales
    if (mapInstanceRef.current) {
      markersRef.current.forEach(marker => {
        try {
          if (marker && marker._icon && marker._icon.innerHTML && marker._icon.innerHTML.includes('ef4444')) {
            mapInstanceRef.current.removeLayer(marker)
          }
        } catch (error) {
          console.log('Error al limpiar marcador temporal:', error)
        }
      })
      
      // Centrar mapa en la ubicación del usuario
      if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
        try {
          mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13)
        } catch (error) {
          console.log('Error al centrar en ubicación del usuario en clearSearch:', error)
          mapInstanceRef.current.setView([defaultCenter.lat, defaultCenter.lng], 13)
        }
      } else {
        mapInstanceRef.current.setView([defaultCenter.lat, defaultCenter.lng], 13)
      }
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return

    const L = window.L

    // Limpiar marcadores temporales anteriores
    markersRef.current.forEach(marker => {
      try {
        if (marker && marker._icon && marker._icon.innerHTML && marker._icon.innerHTML.includes('ef4444')) {
          mapInstanceRef.current.removeLayer(marker)
        }
      } catch (error) {
        console.log('Error al limpiar marcador temporal en búsqueda:', error)
      }
    })

    // Buscar en lugares existentes primero
    const foundPlace = places.find(place => 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (foundPlace && isValidCoordinate(foundPlace.lat, foundPlace.lng)) {
      setSelectedLocation({
        lat: foundPlace.lat,
        lng: foundPlace.lng,
        name: foundPlace.name,
        type: foundPlace.type
      })
      
      mapInstanceRef.current.setView([foundPlace.lat, foundPlace.lng], 15)
      
      // Resaltar marcador
      markersRef.current.forEach(marker => {
        try {
          if (marker && marker.getLatLng) {
            const pos = marker.getLatLng()
            if (pos && pos.lat === foundPlace.lat && pos.lng === foundPlace.lng) {
              marker.openPopup()
            }
          }
        } catch (error) {
          console.log('Error al resaltar marcador:', error)
        }
      })
    } else {
      // Usar Nominatim para búsqueda externa
      getSearchSuggestions(searchQuery)
    }
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden relative bg-white border`}>
      {/* Barra de búsqueda */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="relative search-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar lugares cerca de ${currentCity || 'tu ubicación'}...`}
            className="pl-10 pr-24"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => {
              if (searchSuggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
          />
          
          {/* Sugerencias de búsqueda */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-[1001]">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={clearSearch}
                title="Limpiar búsqueda"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {userLocation && isValidCoordinate(userLocation.lat, userLocation.lng) && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={centerOnUserLocation}
                title="Centrar en mi ubicación"
              >
                <Navigation className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              onClick={() => {
                console.log('🔄 Forzando actualización de ubicación...')
                setIsGettingLocation(true)
                setCurrentCity('Detectando...')
                // Limpiar watcher anterior si existe
                if (locationWatcher) {
                  navigator.geolocation.clearWatch(locationWatcher)
                  setLocationWatcher(null)
                }
                initializeMap()
              }}
              title="Actualizar ubicación"
            >
              <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
              onClick={handleSearch}
            >
              Buscar
            </Button>
            <Button
              size="sm"
              variant={isAddingPlace ? "default" : "outline"}
              className={`h-6 px-2 text-xs ${isAddingPlace ? 'bg-green-500 hover:bg-green-600' : ''}`}
              onClick={() => setIsAddingPlace(!isAddingPlace)}
              title={isAddingPlace ? "Cancelar modo agregar" : "Agregar lugar haciendo clic"}
            >
              <MousePointer className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      >
        {!isMapLoaded && (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
              <p className="text-gray-600">
                {isGettingLocation ? 'Obteniendo tu ubicación...' : 'Cargando mapa...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-[999]">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Leyenda:</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">📍</div>
              <span>Mi ubicación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✅</div>
              <span>Visitado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">⭐</div>
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">🔍</div>
              <span>Resultados de búsqueda</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">💖</div>
              <span>Lugares especiales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de modo agregar lugar */}
      {isAddingPlace && (
        <div className="absolute top-24 left-4 right-4 z-[999]">
          <div className="bg-white rounded-lg shadow-lg p-3 border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-sm">
              <MousePointer className="h-4 w-4 text-green-500" />
              <span className="font-medium text-gray-900">Modo agregar lugar activo</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Haz clic en cualquier punto del mapa para agregar un lugar o evento
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
