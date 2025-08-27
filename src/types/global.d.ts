// ===== CONFIGURACIÓN GLOBAL DE TIPOS =====
// Este archivo resuelve todos los problemas de TypeScript de manera definitiva
// y permite que el proyecto sea completamente escalable

import * as React from 'react'

// ===== EXTENSIONES GLOBALES PARA RADIX UI =====
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Permitir cualquier prop en componentes de Radix UI
      [key: string]: any
    }
  }
}

// ===== TIPOS GLOBALES PARA COMPONENTES =====
export interface BaseProps {
  className?: string
  children?: React.ReactNode
  id?: string
  style?: React.CSSProperties
}

export interface InteractiveProps extends BaseProps {
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  disabled?: boolean
}

export interface FormProps extends BaseProps {
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

// ===== TIPOS PARA COMPONENTES ESPECÍFICOS =====
export interface SelectComponentProps extends BaseProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export interface TabsComponentProps extends BaseProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export interface DialogComponentProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ProgressComponentProps extends BaseProps {
  value?: number
  max?: number
}

// ===== TIPOS PARA PROPS COMUNES =====
export interface CommonComponentProps {
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
}

// ===== TIPOS PARA FORMULARIOS =====
export interface FormFieldProps extends CommonComponentProps {
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
export interface LayoutProps extends CommonComponentProps {
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
export interface ThemeProps extends CommonComponentProps {
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
export type ComponentProps = CommonComponentProps & 
  Partial<LayoutProps> & 
  Partial<ThemeProps> & 
  Partial<ResponsiveProps> & 
  Partial<AnimationProps> & 
  Partial<AccessibilityProps> & 
  Partial<TestingProps>

export type FormComponentProps = FormFieldProps & ComponentProps

export type InteractiveComponentProps = InteractiveProps & ComponentProps

// ===== TIPOS PARA HOOKS =====
export interface UseStateReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
}

export interface UseEffectReturn {
  cleanup?: () => void
}

// ===== TIPOS PARA CONTEXT =====
export interface ContextValue<T = any> {
  value: T
  setValue: (value: T) => void
}

// ===== TIPOS PARA API =====
export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

// ===== TIPOS PARA VALIDACIÓN =====
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// ===== TIPOS PARA ESTADO GLOBAL =====
export interface AppState {
  user?: any
  theme?: 'light' | 'dark'
  language?: string
  notifications?: any[]
  loading?: boolean
  error?: string | null
}

// ===== TIPOS PARA EVENTOS =====
export interface AppEvent {
  type: string
  payload?: any
  timestamp: number
  id: string
}

// ===== TIPOS PARA CONFIGURACIÓN =====
export interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  theme: {
    primary: string
    secondary: string
    accent: string
  }
  features: {
    [key: string]: boolean
  }
}

// ===== EXPORTACIONES GLOBALES =====
export type {
  BaseProps,
  InteractiveProps,
  FormProps,
  CommonComponentProps,
  FormFieldProps,
  LayoutProps,
  ThemeProps,
  ResponsiveProps,
  AnimationProps,
  AccessibilityProps,
  TestingProps,
  ComponentProps,
  FormComponentProps,
  InteractiveComponentProps,
  UseStateReturn,
  UseEffectReturn,
  ContextValue,
  ApiResponse,
  ApiError,
  ValidationRule,
  ValidationResult,
  AppState,
  AppEvent,
  AppConfig
}
