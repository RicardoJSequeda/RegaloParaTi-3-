'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPlace } from '@/types'
import { Button } from './button'
import { Input } from './input'
import { Search, MapPin, Plus, Navigation, Heart, Star, Clock, X } from 'lucide-react'

// Importación dinámica para evitar problemas de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface FreeMapProps {
  places: MapPlace[]
  className?: string
  onAddPlace?: (place: Omit<MapPlace, 'id'>) => void
}

interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
  class: string
}

export function FreeMap({ places, className = "h-96 w-full", onAddPlace }: FreeMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string, type: string} | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.4326, -99.1332])
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setIsClient(true)
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude] as [number, number]
          setUserLocation(userPos)
          setMapCenter(userPos)
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error)
        }
      )
    }
  }, [])

  // Función para buscar lugares usando Nominatim
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const userLat = userLocation ? userLocation[0] : 19.4326
      const userLon = userLocation ? userLocation[1] : -99.1332
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&lat=${userLat}&lon=${userLon}&radius=50000`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error buscando lugares:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Función para manejar cambios en la búsqueda con debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value)
    }, 500)
  }

  // Función para agregar lugar
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
      setSearchResults([])
    }
  }

  // Función para seleccionar lugar de búsqueda
  const handleSelectSearchResult = (result: SearchResult) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name.split(',')[0],
      type: result.class || 'Lugar'
    }
    
    setSelectedLocation(location)
    setSearchResults([])
    setSearchQuery(result.display_name.split(',')[0])
    setMapCenter([location.lat, location.lng])
  }

  // Función para centrar en ubicación del usuario
  const centerOnUserLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation)
    }
  }

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedLocation(null)
  }

  if (!isClient) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Inicializando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden relative bg-white`}>
      {/* Barra de búsqueda */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar restaurantes, lugares, direcciones..."
            className="pl-10 pr-20"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
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
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto border">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                onClick={() => handleSelectSearchResult(result)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {result.class === 'amenity' && result.type === 'restaurant' && (
                      <Heart className="h-4 w-4 text-red-500" />
                    )}
                    {result.class === 'amenity' && result.type === 'cafe' && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    {result.class === 'amenity' && result.type === 'fast_food' && (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                    {!['restaurant', 'cafe', 'fast_food'].includes(result.type) && (
                      <MapPin className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {result.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.display_name.split(',').slice(1, 3).join(',')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 capitalize">
                      {result.class} • {result.type}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para agregar lugar seleccionado */}
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
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcador de ubicación del usuario */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">Mi ubicación</h3>
                  <p className="text-sm text-gray-600">
                    {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcador de lugar seleccionado */}
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">{selectedLocation.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 capitalize">
                    Tipo: {selectedLocation.type}
                  </p>
                  <Button size="sm" onClick={handleAddPlace} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar a la lista
                  </Button>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Marcadores de lugares existentes */}
          {places.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup>
                <div className="p-2 max-w-48">
                  <h3 className="font-bold text-lg mb-1 text-gray-800">
                    {place.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {place.address}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    place.visited 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {place.visited ? 'Visitado' : 'Pendiente'}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
