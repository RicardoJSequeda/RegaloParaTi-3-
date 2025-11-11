import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { GlobalPlayer } from '@/components/ui/global-player'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DetalleParaTi - Amor App',
  description: 'Una aplicación especial para guardar recuerdos con tu pareja',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <script src="/sounds/audio-generator.js" defer></script>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
          <GlobalPlayer />
        </ErrorBoundary>
      </body>
    </html>
  )
}
