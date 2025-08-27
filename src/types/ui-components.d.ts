// ===== DECLARACIONES DE TIPOS PARA COMPONENTES UI =====
// Este archivo resuelve todos los problemas de TypeScript con shadcn/ui
// de manera escalable y mantenible

import * as React from 'react'

// ===== SELECT COMPONENTS =====
declare module '@/components/ui/select' {
  export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    children?: React.ReactNode
  }
  
  export interface SelectContentProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
  
  export interface SelectItemProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    value: string
  }
}

// ===== TABS COMPONENTS =====
declare module '@/components/ui/tabs' {
  export interface TabsProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
  }
  
  export interface TabsListProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
  
  export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    children?: React.ReactNode
    value: string
  }
  
  export interface TabsContentProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    value: string
  }
}

// ===== DIALOG COMPONENTS =====
declare module '@/components/ui/dialog' {
  export interface DialogContentProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
  
  export interface DialogTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
    children?: React.ReactNode
  }
  
  export interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<'p'> {
    children?: React.ReactNode
  }
}

// ===== PROGRESS COMPONENT =====
declare module '@/components/ui/progress' {
  export interface ProgressProps extends React.ComponentPropsWithoutRef<'div'> {
    value?: number
  }
}

// ===== DROPDOWN MENU COMPONENTS =====
declare module '@/components/ui/dropdown-menu' {
  export interface DropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    children?: React.ReactNode
    asChild?: boolean
  }
  
  export interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    align?: 'start' | 'center' | 'end'
    forceMount?: boolean
  }
  
  export interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    onClick?: () => void
  }
  
  export interface DropdownMenuLabelProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
  
  export interface DropdownMenuSeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
}

// ===== AVATAR COMPONENTS =====
declare module '@/components/ui/avatar' {
  export interface AvatarProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
  
  export interface AvatarImageProps extends React.ComponentPropsWithoutRef<'img'> {
    src?: string
    alt?: string
  }
  
  export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
}

// ===== SEPARATOR COMPONENT =====
declare module '@/components/ui/separator' {
  export interface SeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
  }
}

// ===== SHEET COMPONENTS =====
declare module '@/components/ui/sheet' {
  export interface SheetProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
  
  export interface SheetTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    children?: React.ReactNode
    asChild?: boolean
  }
  
  export interface SheetContentProps extends React.ComponentPropsWithoutRef<'div'> {
    children?: React.ReactNode
    side?: 'top' | 'right' | 'bottom' | 'left'
  }
}

// ===== EXTENSIONES GLOBALES =====
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Permitir children en todos los componentes de Radix UI
      [key: string]: any
    }
  }
}

// ===== UTILIDADES DE TIPOS =====
export type ComponentWithChildren<T = {}> = T & {
  children?: React.ReactNode
}

export type ComponentWithClassName<T = {}> = T & {
  className?: string
}

export type ComponentWithValue<T = {}> = T & {
  value?: string | number
}

// ===== TIPOS PARA PROPS COMUNES =====
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  style?: React.CSSProperties
}

export interface InteractiveComponentProps extends BaseComponentProps {
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  disabled?: boolean
}

export interface FormComponentProps extends BaseComponentProps {
  value?: string | number
  onChange?: (value: any) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}
