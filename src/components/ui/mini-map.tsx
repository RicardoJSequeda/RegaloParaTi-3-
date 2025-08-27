'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MiniMapProps {
  location: string
  onLocationChange: (location: string) => void
  className?: string
}

export function MiniMap({ location, onLocationChange, className = '' }: MiniMapProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [mapUrl, setMapUrl] = useState('')

  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Función para buscar ubicaciones usando Nominatim
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching location:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Generar URL del mapa cuando se selecciona una ubicación
  useEffect(() => {
    if (selectedLocation) {
      const { lat, lon } = selectedLocation
      const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`
      setMapUrl(mapUrl)
      onLocationChange(selectedLocation.display_name)
    }
  }, [selectedLocation, onLocationChange])

  // Generar URL del mapa para la ubicación actual
  useEffect(() => {
    if (location && !selectedLocation) {
      // Intentar generar un mapa básico con la ubicación escrita
      const encodedLocation = encodeURIComponent(location)
      const mapUrl = `https://www.openstreetmap.org/search?query=${encodedLocation}`
      setMapUrl(mapUrl)
    }
  }, [location, selectedLocation])

  const handleLocationSelect = (result: any) => {
    setSelectedLocation(result)
    setSearchQuery(result.display_name)
    setSearchResults([])
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Hacer reverse geocoding para obtener la dirección
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          )
            .then(response => response.json())
            .then(data => {
              setSelectedLocation({
                display_name: data.display_name,
                lat: latitude,
                lon: longitude
              })
              setSearchQuery(data.display_name)
            })
            .catch(error => {
              console.error('Error getting current location:', error)
            })
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-green-500" />
          <h4 className="font-semibold text-gray-800">Ubicación del Evento</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Busca y selecciona la ubicación exacta de tu evento.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ubicación (ej: Restaurante El Amor, Calle 123 #45-67)"
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleCurrentLocation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Mi ubicación
          </Button>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto"
          >
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(result)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.display_name}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {isSearching && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              Buscando ubicaciones...
            </div>
          </div>
        )}
      </div>

      {/* Mapa mini */}
      {mapUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Vista previa del mapa</h5>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 underline"
            >
              Ver en mapa completo
            </a>
          </div>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation ? `${selectedLocation.lon - 0.01},${selectedLocation.lat - 0.01},${selectedLocation.lon + 0.01},${selectedLocation.lat + 0.01}` : ''}&layer=mapnik&marker=${selectedLocation ? `${selectedLocation.lat},${selectedLocation.lon}` : ''}`}
              width="100%"
              height="200"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              className="w-full"
              title="Mapa del evento"
            />
            
            {!selectedLocation && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Selecciona una ubicación para ver el mapa</p>
                </div>
              </div>
            )}
          </div>

          {selectedLocation && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Ubicación seleccionada:</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedLocation.display_name}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-blue-500">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-blue-800">Consejo</p>
            <p className="text-xs text-blue-700 mt-1">
              Busca la dirección exacta para que tus invitados puedan encontrar fácilmente el lugar del evento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
