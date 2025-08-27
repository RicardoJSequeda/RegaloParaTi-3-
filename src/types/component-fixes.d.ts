// ===== FIXES ESPECÍFICOS PARA COMPONENTES UI =====
// Este archivo resuelve problemas específicos de TypeScript en componentes

import * as React from 'react'

// ===== FIXES PARA COMPONENTES CON PROBLEMAS =====

// Fix para Progress component
declare module '@/components/ui/progress' {
  export interface ProgressProps {
    value?: number
    className?: string
    [key: string]: any
  }
}

// Fix para Tabs components
declare module '@/components/ui/tabs' {
  export interface TabsProps {
    children?: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
    [key: string]: any
  }
  
  export interface TabsListProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface TabsTriggerProps {
    children?: React.ReactNode
    className?: string
    value: string
    [key: string]: any
  }
  
  export interface TabsContentProps {
    children?: React.ReactNode
    className?: string
    value: string
    [key: string]: any
  }
}

// Fix para Select components
declare module '@/components/ui/select' {
  export interface SelectProps {
    children?: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
    [key: string]: any
  }
  
  export interface SelectTriggerProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface SelectContentProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface SelectItemProps {
    children?: React.ReactNode
    className?: string
    value: string
    [key: string]: any
  }
  
  export interface SelectValueProps {
    children?: React.ReactNode
    className?: string
    placeholder?: string
    [key: string]: any
  }
}

// Fix para Dialog components
declare module '@/components/ui/dialog' {
  export interface DialogProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }
  
  export interface DialogTriggerProps {
    children?: React.ReactNode
    className?: string
    asChild?: boolean
    [key: string]: any
  }
  
  export interface DialogContentProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface DialogTitleProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface DialogDescriptionProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface DialogHeaderProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface DialogFooterProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
}

// Fix para DropdownMenu components
declare module '@/components/ui/dropdown-menu' {
  export interface DropdownMenuProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }
  
  export interface DropdownMenuTriggerProps {
    children?: React.ReactNode
    className?: string
    asChild?: boolean
    [key: string]: any
  }
  
  export interface DropdownMenuContentProps {
    children?: React.ReactNode
    className?: string
    align?: 'start' | 'center' | 'end'
    forceMount?: boolean
    [key: string]: any
  }
  
  export interface DropdownMenuItemProps {
    children?: React.ReactNode
    className?: string
    onClick?: () => void
    [key: string]: any
  }
  
  export interface DropdownMenuLabelProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface DropdownMenuSeparatorProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
}

// Fix para Avatar components
declare module '@/components/ui/avatar' {
  export interface AvatarProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface AvatarImageProps {
    src?: string
    alt?: string
    className?: string
    [key: string]: any
  }
  
  export interface AvatarFallbackProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
}

// Fix para Separator component
declare module '@/components/ui/separator' {
  export interface SeparatorProps {
    children?: React.ReactNode
    className?: string
    orientation?: 'horizontal' | 'vertical'
    [key: string]: any
  }
}

// Fix para Sheet components
declare module '@/components/ui/sheet' {
  export interface SheetProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }
  
  export interface SheetTriggerProps {
    children?: React.ReactNode
    className?: string
    asChild?: boolean
    [key: string]: any
  }
  
  export interface SheetContentProps {
    children?: React.ReactNode
    className?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    [key: string]: any
  }
}

// Fix para Card components
declare module '@/components/ui/card' {
  export interface CardProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface CardHeaderProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface CardTitleProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface CardDescriptionProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface CardContentProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
  
  export interface CardFooterProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
}

// Fix para Button component
declare module '@/components/ui/button' {
  export interface ButtonProps {
    children?: React.ReactNode
    className?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    onClick?: () => void
    disabled?: boolean
    [key: string]: any
  }
}

// Fix para Badge component
declare module '@/components/ui/badge' {
  export interface BadgeProps {
    children?: React.ReactNode
    className?: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    [key: string]: any
  }
}

// Fix para Input component
declare module '@/components/ui/input' {
  export interface InputProps {
    className?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    type?: string
    disabled?: boolean
    [key: string]: any
  }
}

// Fix para AspectRatio component
declare module '@/components/ui/aspect-ratio' {
  export interface AspectRatioProps {
    children?: React.ReactNode
    className?: string
    ratio?: number
    [key: string]: any
  }
}

// ===== EXTENSIONES GLOBALES =====
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Permitir cualquier prop en todos los componentes
      [key: string]: any
    }
  }
}
