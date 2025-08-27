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
import { Heart, Menu, Home, Image, MessageCircle, Music, Gift, Settings, LogOut, User } from 'lucide-react'
import { NavigationItem, Section } from '@/types'
import { useRouter } from 'next/navigation'
import ConfigurationModal from '@/components/ui/configuration-modal'
import { useState } from 'react'

interface NavigationProps {
  navigationItems: NavigationItem[]
  activeSection: Section
  onSectionChange: (section: Section) => void
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
  onLogout: () => void
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

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
  const [showConfig, setShowConfig] = useState(false as boolean)
  return (
    <>
      <ConfigurationModal open={showConfig} onOpenChange={setShowConfig} />
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
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <Button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
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
              })}
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
                    <AvatarImage src="/avatars/user.jpg" alt="Usuario" />
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
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
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
                <DropdownMenuItem onClick={() => setShowConfig(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
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
              className="fixed top-3 left-3 z-50 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm border-border shadow-lg"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id
                    return (
                      <Button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id)
                          onSidebarOpenChange(false)
                        }}
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
                  })}
                </div>
              </nav>

              <Separator className="mx-4 sm:mx-6 mb-4" />

              {/* Footer */}
              <div className="p-4 sm:p-6 space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 sm:h-12 px-3">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src="/avatars/user.jpg" alt="Usuario" />
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
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={() => setShowConfig(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
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
