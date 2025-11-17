'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Menu, Home, Image, MessageCircle, Music, Bell, LogOut, User } from 'lucide-react'
import { NavigationItem, Section } from '@/types'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { notificationService } from '@/services/notification-service'

interface NavigationProps {
  navigationItems: NavigationItem[]
  activeSection: Section
  // @ts-ignore - Next.js warning: Valid React callbacks in client components, not Server Actions. Safe to ignore.
  onSectionChange: (section: Section) => void
  sidebarOpen: boolean
  // @ts-ignore - Next.js warning: Valid React callback in client component
  onSidebarOpenChange: (open: boolean) => void
  // @ts-ignore - Next.js warning: Valid React callback in client component
  onLogout: () => void
  // @ts-ignore - Next.js warning: Valid React callback in client component
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

// @ts-ignore - Next.js warnings: Valid React callbacks in client components, not Server Actions
export function Navigation({
  navigationItems,
  activeSection,
  onSectionChange,
  sidebarOpen,
  onSidebarOpenChange,
  onLogout,
  onToggleDarkMode,
  isDarkMode
}: NavigationProps) {
  const router = useRouter()
  const { requestPermission, permission, isSupported } = useNotifications()
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(permission)

  // Actualizar estado cuando cambie el permiso
  useEffect(() => {
    setNotificationStatus(permission)
  }, [permission])

  // Memoizar handlers para prevenir re-renders
  const handleSectionClick = useCallback((sectionId: Section) => {
    onSectionChange(sectionId)
  }, [onSectionChange])

  const handleMobileSectionClick = useCallback((sectionId: Section) => {
    onSectionChange(sectionId)
    onSidebarOpenChange(false)
  }, [onSectionChange, onSidebarOpenChange])

  const handleNotificationClick = useCallback(async () => {
    if (!isSupported) {
      alert('Las notificaciones no están soportadas en este navegador')
      return
    }

    if (permission === 'granted') {
      // Ya tiene permisos, mostrar mensaje
      alert('Las notificaciones ya están activadas. Recibirás notificaciones cuando haya eventos importantes.')
      return
    }

    if (permission === 'denied') {
      // Permisos denegados, mostrar instrucciones
      alert('Los permisos de notificación fueron denegados. Por favor, habilítalos manualmente en la configuración de tu navegador.')
      return
    }

    // Solicitar permisos
    const granted = await requestPermission()
    if (granted) {
      setNotificationStatus('granted')
      // Iniciar el servicio de notificaciones
      notificationService.start()
      alert('¡Notificaciones activadas! Recibirás notificaciones cuando haya eventos importantes.')
    } else {
      setNotificationStatus('denied')
      alert('Los permisos de notificación fueron denegados.')
    }
  }, [isSupported, permission, requestPermission])

  // Memoizar items de navegación para desktop
  const desktopNavItems = useMemo(() => 
    navigationItems.map((item) => {
      const Icon = item.icon
      const isActive = activeSection === item.id
      return (
        <Button
          key={item.id}
          onClick={() => handleSectionClick(item.id)}
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start gap-3 h-10 text-sm font-medium transition-all duration-200 ${
            isActive 
              ? "bg-secondary text-secondary-foreground shadow-sm" 
              : "hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          {item.label}
          {isActive && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Activo
            </Badge>
          )}
        </Button>
      )
    }), [navigationItems, activeSection, handleSectionClick]
  )

  // Memoizar items de navegación para mobile
  const mobileNavItems = useMemo(() => 
    navigationItems.map((item) => {
      const Icon = item.icon
      const isActive = activeSection === item.id
      return (
        <Button
          key={item.id}
          onClick={() => handleMobileSectionClick(item.id)}
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start gap-3 h-10 sm:h-12 text-sm font-medium transition-all duration-200 ${
            isActive 
              ? "bg-secondary text-secondary-foreground shadow-sm" 
              : "hover:bg-muted hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">{item.label}</span>
          {isActive && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Activo
            </Badge>
          )}
        </Button>
      )
    }), [navigationItems, activeSection, handleMobileSectionClick]
  )
  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-background border-r border-border pt-5 pb-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">DetalleParaTi</h1>
                <p className="text-sm text-muted-foreground">Amor App</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 space-y-1">
            <div className="space-y-1">
              {desktopNavItems}
            </div>
          </nav>

          <Separator className="mx-6 mb-4" />

          {/* Footer */}
          <div className="px-6 space-y-2">
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/avatars/user.jpg" alt="Usuario" onError={(e) => {
                      // Ocultar imagen si falla, mostrar fallback
                      e.currentTarget.style.display = 'none'
                    }} />
                    <AvatarFallback className="text-xs">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Mi Amor</span>
                    <span className="text-xs text-muted-foreground">En línea</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Mi Amor</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      mi.amor@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleDarkMode}>
                  {isDarkMode ? (
                    <>
                      <span className="mr-2">☀️</span>
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🌙</span>
                      <span>Modo Oscuro</span>
                    </>
                  )}
                </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNotificationClick}>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>
                        {notificationStatus === 'granted' ? 'Notificaciones ✓' : 'Activar Notificaciones'}
                      </span>
                    </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <div className="lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 h-12 w-12 sm:h-14 sm:w-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-gray-200 dark:border-gray-700 shadow-xl rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 sm:w-96">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center p-4 sm:p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
                    <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-semibold text-foreground">DetalleParaTi</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">Amor App</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 sm:p-6 space-y-1">
                <div className="space-y-1">
                  {mobileNavItems}
                </div>
              </nav>

              <Separator className="mx-4 sm:mx-6 mb-4" />

              {/* Footer */}
              <div className="p-4 sm:p-6 space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 sm:h-12 px-3">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src="/avatars/user.jpg" alt="Usuario" onError={(e) => {
                          // Ocultar imagen si falla, mostrar fallback
                          e.currentTarget.style.display = 'none'
                        }} />
                        <AvatarFallback className="text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Mi Amor</span>
                        <span className="text-xs text-muted-foreground">En línea</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Mi Amor</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          mi.amor@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onToggleDarkMode}>
                      {isDarkMode ? (
                        <>
                          <span className="mr-2">☀️</span>
                          <span>Modo Claro</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🌙</span>
                          <span>Modo Oscuro</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNotificationClick}>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>
                        {notificationStatus === 'granted' ? 'Notificaciones ✓' : 'Activar Notificaciones'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
