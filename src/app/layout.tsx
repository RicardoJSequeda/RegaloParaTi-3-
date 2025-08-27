import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { GlobalPlayer } from '@/components/ui/global-player'

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
        {children}
        <GlobalPlayer />
      </body>
    </html>
  )
}
