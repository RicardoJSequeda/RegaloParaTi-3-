# 📚 Ejemplos de Uso de las Nuevas Funcionalidades

Este documento contiene ejemplos de cómo usar las nuevas funcionalidades implementadas.

## 🎣 Hook useApi

Hook para manejar requests de API con retry automático y manejo de estados.

### Ejemplo Básico

```typescript
'use client'

import { useApi } from '@/hooks/useApi'
import { useEffect } from 'react'

export function PhotosList() {
  const { data, loading, error, get } = useApi({
    onSuccess: (data) => {
      console.log('Fotos cargadas:', data)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
    retries: 3,
    retryDelay: 1000
  })

  useEffect(() => {
    get('/api/photos')
  }, [get])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <div>
      {data.map(photo => (
        <div key={photo.id}>{photo.title}</div>
      ))}
    </div>
  )
}
```

### Ejemplo con POST

```typescript
'use client'

import { useApi } from '@/hooks/useApi'
import { useState } from 'react'

export function CreatePhoto() {
  const { loading, error, post, data } = useApi()

  const handleSubmit = async (formData: any) => {
    const result = await post('/api/photos', formData)
    if (result) {
      console.log('Foto creada:', result)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear foto'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  )
}
```

## 📝 Hook useForm

Hook para manejar formularios con validación integrada.

### Ejemplo Básico

```typescript
'use client'

import { useForm } from '@/hooks/useForm'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FormData {
  title: string
  description: string
  email: string
}

export function MyForm() {
  const form = useForm<FormData>({
    initialValues: {
      title: '',
      description: '',
      email: ''
    },
    validationRules: {
      title: {
        required: true,
        minLength: 3,
        maxLength: 200,
        type: 'string'
      },
      description: {
        required: false,
        maxLength: 1000,
        type: 'string'
      },
      email: {
        required: true,
        type: 'email'
      }
    },
    onSubmit: async (values) => {
      // Enviar datos
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      if (!response.ok) {
        throw new Error('Error al crear')
      }
    },
    validateOnBlur: true
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <Input
          name="title"
          value={form.values.title}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="Título"
        />
        {form.touched.title && form.errors.title && (
          <div className="error">{form.errors.title}</div>
        )}
      </div>

      <div>
        <Input
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="Email"
        />
        {form.touched.email && form.errors.email && (
          <div className="error">{form.errors.email}</div>
        )}
      </div>

      <Button type="submit" disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>

      {form.submitError && (
        <div className="error">{form.submitError}</div>
      )}
    </form>
  )
}
```

## 🛡️ Error Boundary

Componente para capturar y manejar errores de React.

### Uso Básico

```typescript
'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'
import { MyComponent } from './MyComponent'

export function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

### Con Fallback Personalizado

```typescript
'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'

function CustomErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Intentar de nuevo</button>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary fallback={CustomErrorFallback}>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## 💀 Loading Skeletons

Componentes para mostrar estados de carga.

### Ejemplo

```typescript
'use client'

import { CardSkeleton, ListSkeleton, ImageSkeleton } from '@/components/ui/loading-skeleton'

export function PhotosLoading() {
  return (
    <div>
      <CardSkeleton />
      <ListSkeleton count={5} />
      <ImageSkeleton />
    </div>
  )
}
```

## ⚡ Utilidades de Performance

### Debounce

```typescript
import { debounce } from '@/utils/performance'

// Ejemplo: Buscar con debounce
const searchFunction = debounce((query: string) => {
  console.log('Buscando:', query)
  // Hacer búsqueda
}, 300)

// Usar
searchFunction('texto de búsqueda')
```

### Throttle

```typescript
import { throttle } from '@/utils/performance'

// Ejemplo: Scroll handler
const handleScroll = throttle(() => {
  console.log('Scrolling...')
}, 100)

window.addEventListener('scroll', handleScroll)
```

### Memoize

```typescript
import { memoize } from '@/utils/performance'

// Ejemplo: Función costosa
const expensiveFunction = memoize((n: number) => {
  // Cálculo costoso
  return n * 2
})

// Primera llamada: ejecuta la función
expensiveFunction(5) // Ejecuta

// Segunda llamada con mismo parámetro: usa cache
expensiveFunction(5) // Usa cache
```

## 🗄️ Caching de API

### En API Routes

```typescript
import { apiCache, createCacheKey } from '@/lib/api-cache'

export async function GET() {
  const cacheKey = createCacheKey('photos', 'all')
  
  // Intentar obtener del cache
  const cached = apiCache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    })
  }

  // Obtener datos
  const data = await getData()
  
  // Guardar en cache (5 minutos)
  apiCache.set(cacheKey, data, 5 * 60 * 1000)
  
  return NextResponse.json(data, {
    headers: { 'X-Cache': 'MISS' }
  })
}
```

## 🔄 Combinando Hooks

### useApi + useForm

```typescript
'use client'

import { useApi } from '@/hooks/useApi'
import { useForm } from '@/hooks/useForm'

export function CreatePhotoForm() {
  const { post, loading, error } = useApi()

  const form = useForm({
    initialValues: { title: '', image_url: '' },
    validationRules: {
      title: { required: true, type: 'string' },
      image_url: { required: true, type: 'url' }
    },
    onSubmit: async (values) => {
      await post('/api/photos', values)
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields */}
      <button disabled={loading || form.isSubmitting}>
        {loading ? 'Creando...' : 'Crear'}
      </button>
    </form>
  )
}
```

## 📊 Ejemplo Completo: Lista de Fotos con Loading y Error Handling

```typescript
'use client'

import { useApi } from '@/hooks/useApi'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ListSkeleton } from '@/components/ui/loading-skeleton'
import { useEffect } from 'react'

function PhotosList() {
  const { data, loading, error, get } = useApi({
    retries: 3
  })

  useEffect(() => {
    get('/api/photos')
  }, [get])

  if (loading) return <ListSkeleton count={5} />
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <div>
      {data.map(photo => (
        <div key={photo.id}>{photo.title}</div>
      ))}
    </div>
  )
}

export function PhotosPage() {
  return (
    <ErrorBoundary>
      <PhotosList />
    </ErrorBoundary>
  )
}
```

---

Para más información, consulta la documentación de cada hook y utilidad.

