/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima y estable
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  // Deshabilitar optimizaciones problemáticas
  experimental: {
    // Deshabilitar optimizaciones de chunks problemáticas
    optimizePackageImports: false,
    // Deshabilitar optimizaciones de webpack
    webpackBuildWorker: false
  },
  // Configuración de webpack para resolver problemas
  webpack: (config, { isServer }) => {
    // Deshabilitar optimizaciones problemáticas
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
      runtimeChunk: false
    }
    
    // Configuración para resolver problemas de módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    }
    
    return config
  }
}

module.exports = nextConfig
