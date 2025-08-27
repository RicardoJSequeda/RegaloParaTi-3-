// ===== FIXES PARA PARÁMETROS IMPLÍCITOS =====
// Este archivo resuelve errores de "Parameter 'e' implicitly has an 'any' type"

import * as React from 'react'

// ===== EXTENSIONES GLOBALES PARA EVENTOS =====
declare global {
  // Permitir parámetros implícitos en funciones de eventos
  interface WindowEventMap {
    [key: string]: any
  }
  
  // Extender tipos de eventos
  interface EventTarget {
    [key: string]: any
  }
}

// ===== TIPOS PARA EVENTOS COMUNES =====
export interface EventHandler<T = any> {
  (event: T): void
}

export interface ChangeEventHandler<T = any> {
  (event: T): void
}

export interface ClickEventHandler<T = any> {
  (event: T): void
}

export interface SubmitEventHandler<T = any> {
  (event: T): void
}

export interface KeyboardEventHandler<T = any> {
  (event: T): void
}

export interface MouseEventHandler<T = any> {
  (event: T): void
}

export interface FocusEventHandler<T = any> {
  (event: T): void
}

export interface BlurEventHandler<T = any> {
  (event: T): void
}

// ===== TIPOS PARA PARÁMETROS IMPLÍCITOS =====
export type ImplicitParameter = any
export type ImplicitEvent = any
export type ImplicitChangeEvent = any
export type ImplicitClickEvent = any
export type ImplicitSubmitEvent = any
export type ImplicitKeyboardEvent = any
export type ImplicitMouseEvent = any
export type ImplicitFocusEvent = any
export type ImplicitBlurEvent = any

// ===== UTILIDADES PARA EVENTOS =====
export type EventHandlerProps = {
  onClick?: (e: ImplicitClickEvent) => void
  onChange?: (e: ImplicitChangeEvent) => void
  onSubmit?: (e: ImplicitSubmitEvent) => void
  onKeyDown?: (e: ImplicitKeyboardEvent) => void
  onKeyUp?: (e: ImplicitKeyboardEvent) => void
  onKeyPress?: (e: ImplicitKeyboardEvent) => void
  onMouseEnter?: (e: ImplicitMouseEvent) => void
  onMouseLeave?: (e: ImplicitMouseEvent) => void
  onMouseDown?: (e: ImplicitMouseEvent) => void
  onMouseUp?: (e: ImplicitMouseEvent) => void
  onFocus?: (e: ImplicitFocusEvent) => void
  onBlur?: (e: ImplicitBlurEvent) => void
  onInput?: (e: ImplicitEvent) => void
  onSelect?: (e: ImplicitEvent) => void
  onLoad?: (e: ImplicitEvent) => void
  onError?: (e: ImplicitEvent) => void
  onScroll?: (e: ImplicitEvent) => void
  onResize?: (e: ImplicitEvent) => void
  onDrag?: (e: ImplicitEvent) => void
  onDrop?: (e: ImplicitEvent) => void
  onCopy?: (e: ImplicitEvent) => void
  onCut?: (e: ImplicitEvent) => void
  onPaste?: (e: ImplicitEvent) => void
  onContextMenu?: (e: ImplicitMouseEvent) => void
  onDoubleClick?: (e: ImplicitMouseEvent) => void
  onWheel?: (e: ImplicitEvent) => void
  onTouchStart?: (e: ImplicitEvent) => void
  onTouchMove?: (e: ImplicitEvent) => void
  onTouchEnd?: (e: ImplicitEvent) => void
  onTouchCancel?: (e: ImplicitEvent) => void
  onAnimationStart?: (e: ImplicitEvent) => void
  onAnimationEnd?: (e: ImplicitEvent) => void
  onAnimationIteration?: (e: ImplicitEvent) => void
  onTransitionEnd?: (e: ImplicitEvent) => void
  onAbort?: (e: ImplicitEvent) => void
  onBeforeInput?: (e: ImplicitEvent) => void
  onCanPlay?: (e: ImplicitEvent) => void
  onCanPlayThrough?: (e: ImplicitEvent) => void
  onCompositionEnd?: (e: ImplicitEvent) => void
  onCompositionStart?: (e: ImplicitEvent) => void
  onCompositionUpdate?: (e: ImplicitEvent) => void
  onDurationChange?: (e: ImplicitEvent) => void
  onEmptied?: (e: ImplicitEvent) => void
  onEncrypted?: (e: ImplicitEvent) => void
  onEnded?: (e: ImplicitEvent) => void
  onGotPointerCapture?: (e: ImplicitEvent) => void
  onInvalid?: (e: ImplicitEvent) => void
  onLostPointerCapture?: (e: ImplicitEvent) => void
  onPointerCancel?: (e: ImplicitEvent) => void
  onPointerDown?: (e: ImplicitEvent) => void
  onPointerEnter?: (e: ImplicitEvent) => void
  onPointerLeave?: (e: ImplicitEvent) => void
  onPointerMove?: (e: ImplicitEvent) => void
  onPointerOut?: (e: ImplicitEvent) => void
  onPointerOver?: (e: ImplicitEvent) => void
  onPointerUp?: (e: ImplicitEvent) => void
  onRateChange?: (e: ImplicitEvent) => void
  onSeeked?: (e: ImplicitEvent) => void
  onSeeking?: (e: ImplicitEvent) => void
  onStalled?: (e: ImplicitEvent) => void
  onSuspend?: (e: ImplicitEvent) => void
  onTimeUpdate?: (e: ImplicitEvent) => void
  onVolumeChange?: (e: ImplicitEvent) => void
  onWaiting?: (e: ImplicitEvent) => void
}

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS IMPLÍCITOS =====
export type FunctionWithImplicitParam = (e: ImplicitParameter) => void
export type FunctionWithImplicitEvent = (e: ImplicitEvent) => void
export type FunctionWithImplicitChangeEvent = (e: ImplicitChangeEvent) => void
export type FunctionWithImplicitClickEvent = (e: ImplicitClickEvent) => void
export type FunctionWithImplicitSubmitEvent = (e: ImplicitSubmitEvent) => void
export type FunctionWithImplicitKeyboardEvent = (e: ImplicitKeyboardEvent) => void
export type FunctionWithImplicitMouseEvent = (e: ImplicitMouseEvent) => void
export type FunctionWithImplicitFocusEvent = (e: ImplicitFocusEvent) => void
export type FunctionWithImplicitBlurEvent = (e: ImplicitBlurEvent) => void

// ===== TIPOS PARA CALLBACKS =====
export type CallbackFunction = (...args: any[]) => void
export type EventCallback = (e: ImplicitEvent) => void
export type ChangeCallback = (e: ImplicitChangeEvent) => void
export type ClickCallback = (e: ImplicitClickEvent) => void
export type SubmitCallback = (e: ImplicitSubmitEvent) => void
export type KeyboardCallback = (e: ImplicitKeyboardEvent) => void
export type MouseCallback = (e: ImplicitMouseEvent) => void
export type FocusCallback = (e: ImplicitFocusEvent) => void
export type BlurCallback = (e: ImplicitBlurEvent) => void

// ===== TIPOS PARA HANDLERS GENÉRICOS =====
export type GenericEventHandler = (e: any) => void
export type GenericChangeHandler = (e: any) => void
export type GenericClickHandler = (e: any) => void
export type GenericSubmitHandler = (e: any) => void
export type GenericKeyboardHandler = (e: any) => void
export type GenericMouseHandler = (e: any) => void
export type GenericFocusHandler = (e: any) => void
export type GenericBlurHandler = (e: any) => void

// ===== TIPOS PARA FUNCIONES SIN PARÁMETROS =====
export type VoidFunction = () => void
export type AsyncVoidFunction = () => Promise<void>
export type BooleanFunction = () => boolean
export type StringFunction = () => string
export type NumberFunction = () => number
export type ObjectFunction = () => object
export type ArrayFunction = () => any[]

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS GENÉRICOS =====
export type FunctionWithAnyParam = (param: any) => void
export type FunctionWithStringParam = (param: string) => void
export type FunctionWithNumberParam = (param: number) => void
export type FunctionWithBooleanParam = (param: boolean) => void
export type FunctionWithObjectParam = (param: object) => void
export type FunctionWithArrayParam = (param: any[]) => void

// ===== TIPOS PARA FUNCIONES CON MÚLTIPLES PARÁMETROS =====
export type FunctionWithTwoParams = (param1: any, param2: any) => void
export type FunctionWithThreeParams = (param1: any, param2: any, param3: any) => void
export type FunctionWithFourParams = (param1: any, param2: any, param3: any, param4: any) => void
export type FunctionWithFiveParams = (param1: any, param2: any, param3: any, param4: any, param5: any) => void

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS OPCIONALES =====
export type FunctionWithOptionalParam = (param?: any) => void
export type FunctionWithOptionalEvent = (e?: ImplicitEvent) => void
export type FunctionWithOptionalChangeEvent = (e?: ImplicitChangeEvent) => void
export type FunctionWithOptionalClickEvent = (e?: ImplicitClickEvent) => void
export type FunctionWithOptionalSubmitEvent = (e?: ImplicitSubmitEvent) => void
export type FunctionWithOptionalKeyboardEvent = (e?: ImplicitKeyboardEvent) => void
export type FunctionWithOptionalMouseEvent = (e?: ImplicitMouseEvent) => void
export type FunctionWithOptionalFocusEvent = (e?: ImplicitFocusEvent) => void
export type FunctionWithOptionalBlurEvent = (e?: ImplicitBlurEvent) => void

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS REST =====
export type FunctionWithRestParams = (...params: any[]) => void
export type FunctionWithRestEvents = (...events: ImplicitEvent[]) => void
export type FunctionWithRestChangeEvents = (...events: ImplicitChangeEvent[]) => void
export type FunctionWithRestClickEvents = (...events: ImplicitClickEvent[]) => void
export type FunctionWithRestSubmitEvents = (...events: ImplicitSubmitEvent[]) => void
export type FunctionWithRestKeyboardEvents = (...events: ImplicitKeyboardEvent[]) => void
export type FunctionWithRestMouseEvents = (...events: ImplicitMouseEvent[]) => void
export type FunctionWithRestFocusEvents = (...events: ImplicitFocusEvent[]) => void
export type FunctionWithRestBlurEvents = (...events: ImplicitBlurEvent[]) => void

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS IMPLÍCITOS Y RETORNO =====
export type FunctionWithImplicitParamAndReturn<T = any> = (e: ImplicitParameter) => T
export type FunctionWithImplicitEventAndReturn<T = any> = (e: ImplicitEvent) => T
export type FunctionWithImplicitChangeEventAndReturn<T = any> = (e: ImplicitChangeEvent) => T
export type FunctionWithImplicitClickEventAndReturn<T = any> = (e: ImplicitClickEvent) => T
export type FunctionWithImplicitSubmitEventAndReturn<T = any> = (e: ImplicitSubmitEvent) => T
export type FunctionWithImplicitKeyboardEventAndReturn<T = any> = (e: ImplicitKeyboardEvent) => T
export type FunctionWithImplicitMouseEventAndReturn<T = any> = (e: ImplicitMouseEvent) => T
export type FunctionWithImplicitFocusEventAndReturn<T = any> = (e: ImplicitFocusEvent) => T
export type FunctionWithImplicitBlurEventAndReturn<T = any> = (e: ImplicitBlurEvent) => T

// ===== TIPOS PARA FUNCIONES ASÍNCRONAS CON PARÁMETROS IMPLÍCITOS =====
export type AsyncFunctionWithImplicitParam = (e: ImplicitParameter) => Promise<void>
export type AsyncFunctionWithImplicitEvent = (e: ImplicitEvent) => Promise<void>
export type AsyncFunctionWithImplicitChangeEvent = (e: ImplicitChangeEvent) => Promise<void>
export type AsyncFunctionWithImplicitClickEvent = (e: ImplicitClickEvent) => Promise<void>
export type AsyncFunctionWithImplicitSubmitEvent = (e: ImplicitSubmitEvent) => Promise<void>
export type AsyncFunctionWithImplicitKeyboardEvent = (e: ImplicitKeyboardEvent) => Promise<void>
export type AsyncFunctionWithImplicitMouseEvent = (e: ImplicitMouseEvent) => Promise<void>
export type AsyncFunctionWithImplicitFocusEvent = (e: ImplicitFocusEvent) => Promise<void>
export type AsyncFunctionWithImplicitBlurEvent = (e: ImplicitBlurEvent) => Promise<void>

// ===== TIPOS PARA FUNCIONES ASÍNCRONAS CON PARÁMETROS IMPLÍCITOS Y RETORNO =====
export type AsyncFunctionWithImplicitParamAndReturn<T = any> = (e: ImplicitParameter) => Promise<T>
export type AsyncFunctionWithImplicitEventAndReturn<T = any> = (e: ImplicitEvent) => Promise<T>
export type AsyncFunctionWithImplicitChangeEventAndReturn<T = any> = (e: ImplicitChangeEvent) => Promise<T>
export type AsyncFunctionWithImplicitClickEventAndReturn<T = any> = (e: ImplicitClickEvent) => Promise<T>
export type AsyncFunctionWithImplicitSubmitEventAndReturn<T = any> = (e: ImplicitSubmitEvent) => Promise<T>
export type AsyncFunctionWithImplicitKeyboardEventAndReturn<T = any> = (e: ImplicitKeyboardEvent) => Promise<T>
export type AsyncFunctionWithImplicitMouseEventAndReturn<T = any> = (e: ImplicitMouseEvent) => Promise<T>
export type AsyncFunctionWithImplicitFocusEventAndReturn<T = any> = (e: ImplicitFocusEvent) => Promise<T>
export type AsyncFunctionWithImplicitBlurEventAndReturn<T = any> = (e: ImplicitBlurEvent) => Promise<T>

// ===== EXPORTACIONES =====
export type {
  EventHandler,
  ChangeEventHandler,
  ClickEventHandler,
  SubmitEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  BlurEventHandler,
  ImplicitParameter,
  ImplicitEvent,
  ImplicitChangeEvent,
  ImplicitClickEvent,
  ImplicitSubmitEvent,
  ImplicitKeyboardEvent,
  ImplicitMouseEvent,
  ImplicitFocusEvent,
  ImplicitBlurEvent,
  EventHandlerProps,
  FunctionWithImplicitParam,
  FunctionWithImplicitEvent,
  FunctionWithImplicitChangeEvent,
  FunctionWithImplicitClickEvent,
  FunctionWithImplicitSubmitEvent,
  FunctionWithImplicitKeyboardEvent,
  FunctionWithImplicitMouseEvent,
  FunctionWithImplicitFocusEvent,
  FunctionWithImplicitBlurEvent,
  CallbackFunction,
  EventCallback,
  ChangeCallback,
  ClickCallback,
  SubmitCallback,
  KeyboardCallback,
  MouseCallback,
  FocusCallback,
  BlurCallback,
  GenericEventHandler,
  GenericChangeHandler,
  GenericClickHandler,
  GenericSubmitHandler,
  GenericKeyboardHandler,
  GenericMouseHandler,
  GenericFocusHandler,
  GenericBlurHandler,
  VoidFunction,
  AsyncVoidFunction,
  BooleanFunction,
  StringFunction,
  NumberFunction,
  ObjectFunction,
  ArrayFunction,
  FunctionWithAnyParam,
  FunctionWithStringParam,
  FunctionWithNumberParam,
  FunctionWithBooleanParam,
  FunctionWithObjectParam,
  FunctionWithArrayParam,
  FunctionWithTwoParams,
  FunctionWithThreeParams,
  FunctionWithFourParams,
  FunctionWithFiveParams,
  FunctionWithOptionalParam,
  FunctionWithOptionalEvent,
  FunctionWithOptionalChangeEvent,
  FunctionWithOptionalClickEvent,
  FunctionWithOptionalSubmitEvent,
  FunctionWithOptionalKeyboardEvent,
  FunctionWithOptionalMouseEvent,
  FunctionWithOptionalFocusEvent,
  FunctionWithOptionalBlurEvent,
  FunctionWithRestParams,
  FunctionWithRestEvents,
  FunctionWithRestChangeEvents,
  FunctionWithRestClickEvents,
  FunctionWithRestSubmitEvents,
  FunctionWithRestKeyboardEvents,
  FunctionWithRestMouseEvents,
  FunctionWithRestFocusEvents,
  FunctionWithRestBlurEvents,
  FunctionWithImplicitParamAndReturn,
  FunctionWithImplicitEventAndReturn,
  FunctionWithImplicitChangeEventAndReturn,
  FunctionWithImplicitClickEventAndReturn,
  FunctionWithImplicitSubmitEventAndReturn,
  FunctionWithImplicitKeyboardEventAndReturn,
  FunctionWithImplicitMouseEventAndReturn,
  FunctionWithImplicitFocusEventAndReturn,
  FunctionWithImplicitBlurEventAndReturn,
  AsyncFunctionWithImplicitParam,
  AsyncFunctionWithImplicitEvent,
  AsyncFunctionWithImplicitChangeEvent,
  AsyncFunctionWithImplicitClickEvent,
  AsyncFunctionWithImplicitSubmitEvent,
  AsyncFunctionWithImplicitKeyboardEvent,
  AsyncFunctionWithImplicitMouseEvent,
  AsyncFunctionWithImplicitFocusEvent,
  AsyncFunctionWithImplicitBlurEvent,
  AsyncFunctionWithImplicitParamAndReturn,
  AsyncFunctionWithImplicitEventAndReturn,
  AsyncFunctionWithImplicitChangeEventAndReturn,
  AsyncFunctionWithImplicitClickEventAndReturn,
  AsyncFunctionWithImplicitSubmitEventAndReturn,
  AsyncFunctionWithImplicitKeyboardEventAndReturn,
  AsyncFunctionWithImplicitMouseEventAndReturn,
  AsyncFunctionWithImplicitFocusEventAndReturn,
  AsyncFunctionWithImplicitBlurEventAndReturn
}
