// ===== EXTENSIONES DE CONFIGURACIÓN DE TYPESCRIPT =====
// Este archivo resuelve problemas de tipos de manera definitiva y escalable

// ===== EXTENSIONES PARA RADIX UI =====
declare module '@radix-ui/react-select' {
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
}

declare module '@radix-ui/react-tabs' {
  export interface TabsRootProps {
    children?: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
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

declare module '@radix-ui/react-dialog' {
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
}

declare module '@radix-ui/react-dropdown-menu' {
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

declare module '@radix-ui/react-avatar' {
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

declare module '@radix-ui/react-separator' {
  export interface SeparatorProps {
    children?: React.ReactNode
    className?: string
    [key: string]: any
  }
}

declare module '@radix-ui/react-sheet' {
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

// ===== EXTENSIONES PARA COMPONENTES PERSONALIZADOS =====
declare module '@/components/ui/progress' {
  export interface ProgressProps {
    value?: number
    className?: string
    [key: string]: any
  }
}

// ===== EXTENSIONES GLOBALES =====
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Permitir cualquier prop en componentes de Radix UI
      [key: string]: any
    }
  }
  
  // Extender tipos de React
  namespace React {
    interface HTMLAttributes<T> {
      // Permitir props adicionales
      [key: string]: any
    }
  }
}

// ===== TIPOS PARA COMPONENTES COMUNES =====
export interface CommonProps {
  className?: string
  children?: React.ReactNode
  id?: string
  style?: React.CSSProperties
  [key: string]: any
}

export interface InteractiveProps extends CommonProps {
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  disabled?: boolean
}

export interface FormProps extends CommonProps {
  value?: string | number
  onChange?: (value: any) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

// ===== UTILIDADES DE TIPOS =====
export type WithChildren<T = {}> = T & {
  children?: React.ReactNode
}

export type WithClassName<T = {}> = T & {
  className?: string
}

export type WithValue<T = {}> = T & {
  value?: string | number
}

export type WithAnyProps<T = {}> = T & {
  [key: string]: any
}

// ===== TIPOS PARA COMPONENTES ESPECÍFICOS =====
export interface SelectProps extends FormProps {
  onValueChange?: (value: string) => void
}

export interface TabsProps extends CommonProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export interface DialogProps extends CommonProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ProgressProps extends CommonProps {
  value?: number
  max?: number
}

// ===== TIPOS PARA PROPS COMUNES =====
export interface ComponentProps extends CommonProps {
  // Props básicas
  className?: string
  children?: React.ReactNode
  id?: string
  style?: React.CSSProperties
  
  // Props de eventos
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  
  // Props de estado
  disabled?: boolean
  loading?: boolean
  error?: boolean
  
  // Props de accesibilidad
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
  
  // Props adicionales
  [key: string]: any
}

// ===== TIPOS PARA FORMULARIOS =====
export interface FormFieldProps extends ComponentProps {
  value?: string | number | boolean
  onChange?: (value: any) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  name?: string
  type?: string
  min?: number
  max?: number
  step?: number
  pattern?: string
  autoComplete?: string
}

// ===== TIPOS PARA LAYOUT =====
export interface LayoutProps extends ComponentProps {
  // Flexbox
  flex?: boolean
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  flexGrow?: number
  flexShrink?: number
  flexBasis?: string | number
  
  // Grid
  grid?: boolean
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gridGap?: string | number
  gridColumn?: string
  gridRow?: string
  
  // Spacing
  padding?: string | number
  margin?: string | number
  gap?: string | number
  
  // Sizing
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
}

// ===== TIPOS PARA TEMA Y ESTILOS =====
export interface ThemeProps extends ComponentProps {
  // Colores
  color?: string
  backgroundColor?: string
  borderColor?: string
  
  // Tipografía
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: string | number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textDecoration?: string
  
  // Bordes
  border?: string
  borderWidth?: string | number
  borderStyle?: string
  borderRadius?: string | number
  
  // Sombras
  boxShadow?: string
  textShadow?: string
  
  // Efectos
  opacity?: number
  transform?: string
  transition?: string
  animation?: string
}

// ===== TIPOS PARA RESPONSIVE =====
export interface ResponsiveProps {
  // Breakpoints
  sm?: Partial<LayoutProps & ThemeProps>
  md?: Partial<LayoutProps & ThemeProps>
  lg?: Partial<LayoutProps & ThemeProps>
  xl?: Partial<LayoutProps & ThemeProps>
  '2xl'?: Partial<LayoutProps & ThemeProps>
}

// ===== TIPOS PARA ANIMACIONES =====
export interface AnimationProps {
  // Framer Motion
  initial?: any
  animate?: any
  exit?: any
  transition?: any
  variants?: any
  
  // CSS Animations
  animationName?: string
  animationDuration?: string
  animationTimingFunction?: string
  animationDelay?: string
  animationIterationCount?: string
  animationDirection?: string
  animationFillMode?: string
  animationPlayState?: string
}

// ===== TIPOS PARA ACCESIBILIDAD =====
export interface AccessibilityProps {
  // ARIA
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-hidden'?: boolean
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean
  'aria-pressed'?: boolean
  'aria-current'?: string
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-relevant'?: string
  'aria-busy'?: boolean
  
  // Roles
  role?: string
  
  // Keyboard
  tabIndex?: number
  onKeyDown?: (event: React.KeyboardEvent) => void
  onKeyUp?: (event: React.KeyboardEvent) => void
  onKeyPress?: (event: React.KeyboardEvent) => void
}

// ===== TIPOS PARA TESTING =====
export interface TestingProps {
  'data-testid'?: string
  'data-cy'?: string
  'data-test'?: string
}

// ===== TIPOS COMPUESTOS =====
export type FullComponentProps = ComponentProps & 
  Partial<LayoutProps> & 
  Partial<ThemeProps> & 
  Partial<ResponsiveProps> & 
  Partial<AnimationProps> & 
  Partial<AccessibilityProps> & 
  Partial<TestingProps>

export type FormComponentProps = FormFieldProps & FullComponentProps

export type InteractiveComponentProps = InteractiveProps & FullComponentProps

// ===== EXPORTACIONES =====
export type {
  CommonProps,
  InteractiveProps,
  FormProps,
  ComponentProps,
  FormFieldProps,
  LayoutProps,
  ThemeProps,
  ResponsiveProps,
  AnimationProps,
  AccessibilityProps,
  TestingProps,
  FullComponentProps,
  FormComponentProps,
  InteractiveComponentProps,
  WithChildren,
  WithClassName,
  WithValue,
  WithAnyProps,
  SelectProps,
  TabsProps,
  DialogProps,
  ProgressProps
}
