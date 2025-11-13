/**
 * Utilidad para diagnosticar problemas de conexión con Supabase
 */
export async function testSupabaseConnection() {
  const results = {
    envVars: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO DEFINIDA',
      keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NO DEFINIDA'
    },
    urlFormat: {
      valid: false,
      hasSpaces: false,
      startsWithHttps: false,
      containsSupabase: false,
      error: ''
    },
    connection: {
      success: false,
      error: '',
      details: {}
    }
  }

  // Verificar variables de entorno
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  // Validar formato de URL
  if (url) {
    results.urlFormat.hasSpaces = url.includes(' ')
    results.urlFormat.startsWithHttps = url.startsWith('https://')
    results.urlFormat.containsSupabase = url.includes('.supabase.co')
    results.urlFormat.valid = results.urlFormat.startsWithHttps && results.urlFormat.containsSupabase && !results.urlFormat.hasSpaces
    
    if (!results.urlFormat.valid) {
      const errors = []
      if (results.urlFormat.hasSpaces) errors.push('La URL contiene espacios')
      if (!results.urlFormat.startsWithHttps) errors.push('La URL no comienza con https://')
      if (!results.urlFormat.containsSupabase) errors.push('La URL no contiene .supabase.co')
      results.urlFormat.error = errors.join(', ')
    }
  }

  // Intentar conexión
  if (url && key && results.urlFormat.valid) {
    try {
      const { createBrowserClient } = await import('@supabase/ssr')
      const client = createBrowserClient(url, key)
      
      // Intentar una consulta simple
      const { data, error } = await client.from('messages').select('count').limit(1)
      
      if (error) {
        results.connection.error = error.message
        results.connection.details = {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      } else {
        results.connection.success = true
      }
    } catch (error) {
      results.connection.error = error instanceof Error ? error.message : 'Error desconocido'
      results.connection.details = { error }
    }
  }

  return results
}

