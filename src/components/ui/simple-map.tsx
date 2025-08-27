'use client'

import { useState, useEffect } from 'react'
import { MapPlace } from '@/types'
import { Button } from './button'
import { Input } from './input'
import { Search, MapPin, Plus, Navigation, X } from 'lucide-react'

interface SimpleMapProps {
  places: MapPlace[]
  className?: string
  onAddPlace?: (place: Omit<MapPlace, 'id'>) => void
}

// @ts-ignore - onAddPlace function prop is expected for client component
export function SimpleMap({ places, className = "h-96 w-full", onAddPlace }: SimpleMapProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string, type: string} | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Coordenadas por defecto (Montería, Córdoba)
  const defaultCenter = { lat: 8.7505, lng: -75.8786 }

  useEffect(() => {
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)
          updateMapUrl(userPos.lat, userPos.lng)
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error)
          updateMapUrl(defaultCenter.lat, defaultCenter.lng)
        }
      )
    } else {
      updateMapUrl(defaultCenter.lat, defaultCenter.lng)
    }
  }, [])

  const updateMapUrl = (lat: number, lng: number, zoom: number = 13) => {
    // Crear URL de Google Maps embebido
    const url = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${lat},${lng}&zoom=${zoom}`
    setMapUrl(url)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // Usar la API de geocoding de Google Maps
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
    
    fetch(geocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          const location = result.geometry.location
          const name = result.formatted_address.split(',')[0]
          
          setSelectedLocation({
            lat: location.lat,
            lng: location.lng,
            name: name,
            type: 'Lugar'
          })
          
          updateMapUrl(location.lat, location.lng, 15)
        }
      })
      .catch(error => {
        console.error('Error en geocoding:', error)
        // Fallback: buscar en lugares existentes
        const foundPlace = places.find(place => 
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        
        if (foundPlace) {
          setSelectedLocation({
            lat: foundPlace.lat,
            lng: foundPlace.lng,
            name: foundPlace.name,
            type: foundPlace.type
          })
          updateMapUrl(foundPlace.lat, foundPlace.lng, 15)
        }
      })
  }

  const handleAddPlace = () => {
    if (selectedLocation && onAddPlace) {
      onAddPlace({
        name: selectedLocation.name,
        address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        type: selectedLocation.type,
        visited: false
      })
      setSelectedLocation(null)
      setSearchQuery('')
    }
  }

  const centerOnUserLocation = () => {
    if (userLocation) {
      updateMapUrl(userLocation.lat, userLocation.lng, 15)
      setSelectedLocation(null)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedLocation(null)
    if (userLocation) {
      updateMapUrl(userLocation.lat, userLocation.lng)
    } else {
      updateMapUrl(defaultCenter.lat, defaultCenter.lng)
    }
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden relative bg-white border`}>
      {/* Barra de búsqueda */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar lugares, direcciones... (ej: Tv. 3 #21-7, Montería)"
            className="pl-10 pr-24"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
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
            {userLocation && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={centerOnUserLocation}
                title="Mi ubicación"
              >
                <Navigation className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Información de lugar seleccionado */}
        {selectedLocation && (
          <div className="mt-2 bg-white rounded-lg shadow-lg p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{selectedLocation.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
                <div className="text-xs text-gray-400 mt-1 capitalize">
                  Tipo: {selectedLocation.type}
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddPlace}
                className="bg-pink-500 hover:bg-pink-600 ml-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contenedor del mapa */}
      <div className="w-full h-full">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Marcadores de lugares existentes (overlay) */}
      {places.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[999]">
          <div className="bg-white rounded-lg shadow-lg p-3 max-w-64 max-h-48 overflow-y-auto">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Lugares guardados:</h4>
            <div className="space-y-2">
              {places.slice(0, 5).map((place) => (
                <div key={place.id} className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-pink-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate">{place.name}</div>
                    <div className="text-gray-500 truncate">{place.address}</div>
                  </div>
                </div>
              ))}
              {places.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  +{places.length - 5} lugares más
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
