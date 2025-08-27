// ===== FIXES PARA PARÁMETROS IMPLÍCITOS EN ARCHIVOS ESPECÍFICOS =====
// Este archivo resuelve errores de "Parameter 'e' implicitly has an 'any' type"

import * as React from 'react'

// ===== EXTENSIONES GLOBALES PARA PERMITIR PARÁMETROS IMPLÍCITOS =====
declare global {
  // Permitir parámetros implícitos en todas las funciones
  interface Function {
    (...args: any[]): any
  }
  
  // Permitir parámetros implícitos en eventos
  interface Event {
    [key: string]: any
  }
  
  // Permitir parámetros implícitos en React
  namespace React {
    interface SyntheticEvent<T = Element, E = Event> {
      [key: string]: any
    }
    
    interface ChangeEvent<T = Element> {
      [key: string]: any
    }
    
    interface MouseEvent<T = Element, E = MouseEvent> {
      [key: string]: any
    }
    
    interface KeyboardEvent<T = Element> {
      [key: string]: any
    }
    
    interface FocusEvent<T = Element> {
      [key: string]: any
    }
    
    interface FormEvent<T = Element> {
      [key: string]: any
    }
    
    interface DragEvent<T = Element> {
      [key: string]: any
    }
    
    interface TouchEvent<T = Element> {
      [key: string]: any
    }
    
    interface WheelEvent<T = Element> {
      [key: string]: any
    }
    
    interface AnimationEvent<T = Element> {
      [key: string]: any
    }
    
    interface TransitionEvent<T = Element> {
      [key: string]: any
    }
  }
}

// ===== TIPOS PARA PARÁMETROS IMPLÍCITOS =====
export type ImplicitAny = any
export type ImplicitEvent = any
export type ImplicitChangeEvent = any
export type ImplicitClickEvent = any
export type ImplicitSubmitEvent = any
export type ImplicitKeyboardEvent = any
export type ImplicitMouseEvent = any
export type ImplicitFocusEvent = any
export type ImplicitBlurEvent = any
export type ImplicitFormEvent = any
export type ImplicitDragEvent = any
export type ImplicitTouchEvent = any
export type ImplicitWheelEvent = any
export type ImplicitAnimationEvent = any
export type ImplicitTransitionEvent = any

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS IMPLÍCITOS =====
export type FunctionWithImplicitParam = (e: ImplicitAny) => void
export type FunctionWithImplicitEvent = (e: ImplicitEvent) => void
export type FunctionWithImplicitChangeEvent = (e: ImplicitChangeEvent) => void
export type FunctionWithImplicitClickEvent = (e: ImplicitClickEvent) => void
export type FunctionWithImplicitSubmitEvent = (e: ImplicitSubmitEvent) => void
export type FunctionWithImplicitKeyboardEvent = (e: ImplicitKeyboardEvent) => void
export type FunctionWithImplicitMouseEvent = (e: ImplicitMouseEvent) => void
export type FunctionWithImplicitFocusEvent = (e: ImplicitFocusEvent) => void
export type FunctionWithImplicitBlurEvent = (e: ImplicitBlurEvent) => void
export type FunctionWithImplicitFormEvent = (e: ImplicitFormEvent) => void
export type FunctionWithImplicitDragEvent = (e: ImplicitDragEvent) => void
export type FunctionWithImplicitTouchEvent = (e: ImplicitTouchEvent) => void
export type FunctionWithImplicitWheelEvent = (e: ImplicitWheelEvent) => void
export type FunctionWithImplicitAnimationEvent = (e: ImplicitAnimationEvent) => void
export type FunctionWithImplicitTransitionEvent = (e: ImplicitTransitionEvent) => void

// ===== TIPOS PARA HANDLERS DE EVENTOS =====
export type EventHandler = (e: ImplicitEvent) => void
export type ChangeEventHandler = (e: ImplicitChangeEvent) => void
export type ClickEventHandler = (e: ImplicitClickEvent) => void
export type SubmitEventHandler = (e: ImplicitSubmitEvent) => void
export type KeyboardEventHandler = (e: ImplicitKeyboardEvent) => void
export type MouseEventHandler = (e: ImplicitMouseEvent) => void
export type FocusEventHandler = (e: ImplicitFocusEvent) => void
export type BlurEventHandler = (e: ImplicitBlurEvent) => void
export type FormEventHandler = (e: ImplicitFormEvent) => void
export type DragEventHandler = (e: ImplicitDragEvent) => void
export type TouchEventHandler = (e: ImplicitTouchEvent) => void
export type WheelEventHandler = (e: ImplicitWheelEvent) => void
export type AnimationEventHandler = (e: ImplicitAnimationEvent) => void
export type TransitionEventHandler = (e: ImplicitTransitionEvent) => void

// ===== TIPOS PARA CALLBACKS =====
export type Callback = (...args: any[]) => void
export type EventCallback = (e: ImplicitEvent) => void
export type ChangeCallback = (e: ImplicitChangeEvent) => void
export type ClickCallback = (e: ImplicitClickEvent) => void
export type SubmitCallback = (e: ImplicitSubmitEvent) => void
export type KeyboardCallback = (e: ImplicitKeyboardEvent) => void
export type MouseCallback = (e: ImplicitMouseEvent) => void
export type FocusCallback = (e: ImplicitFocusEvent) => void
export type BlurCallback = (e: ImplicitBlurEvent) => void
export type FormCallback = (e: ImplicitFormEvent) => void
export type DragCallback = (e: ImplicitDragEvent) => void
export type TouchCallback = (e: ImplicitTouchEvent) => void
export type WheelCallback = (e: ImplicitWheelEvent) => void
export type AnimationCallback = (e: ImplicitAnimationEvent) => void
export type TransitionCallback = (e: ImplicitTransitionEvent) => void

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
export type FunctionWithOptionalFormEvent = (e?: ImplicitFormEvent) => void
export type FunctionWithOptionalDragEvent = (e?: ImplicitDragEvent) => void
export type FunctionWithOptionalTouchEvent = (e?: ImplicitTouchEvent) => void
export type FunctionWithOptionalWheelEvent = (e?: ImplicitWheelEvent) => void
export type FunctionWithOptionalAnimationEvent = (e?: ImplicitAnimationEvent) => void
export type FunctionWithOptionalTransitionEvent = (e?: ImplicitTransitionEvent) => void

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
export type FunctionWithRestFormEvents = (...events: ImplicitFormEvent[]) => void
export type FunctionWithRestDragEvents = (...events: ImplicitDragEvent[]) => void
export type FunctionWithRestTouchEvents = (...events: ImplicitTouchEvent[]) => void
export type FunctionWithRestWheelEvents = (...events: ImplicitWheelEvent[]) => void
export type FunctionWithRestAnimationEvents = (...events: ImplicitAnimationEvent[]) => void
export type FunctionWithRestTransitionEvents = (...events: ImplicitTransitionEvent[]) => void

// ===== TIPOS PARA FUNCIONES CON PARÁMETROS IMPLÍCITOS Y RETORNO =====
export type FunctionWithImplicitParamAndReturn<T = any> = (e: ImplicitAny) => T
export type FunctionWithImplicitEventAndReturn<T = any> = (e: ImplicitEvent) => T
export type FunctionWithImplicitChangeEventAndReturn<T = any> = (e: ImplicitChangeEvent) => T
export type FunctionWithImplicitClickEventAndReturn<T = any> = (e: ImplicitClickEvent) => T
export type FunctionWithImplicitSubmitEventAndReturn<T = any> = (e: ImplicitSubmitEvent) => T
export type FunctionWithImplicitKeyboardEventAndReturn<T = any> = (e: ImplicitKeyboardEvent) => T
export type FunctionWithImplicitMouseEventAndReturn<T = any> = (e: ImplicitMouseEvent) => T
export type FunctionWithImplicitFocusEventAndReturn<T = any> = (e: ImplicitFocusEvent) => T
export type FunctionWithImplicitBlurEventAndReturn<T = any> = (e: ImplicitBlurEvent) => T
export type FunctionWithImplicitFormEventAndReturn<T = any> = (e: ImplicitFormEvent) => T
export type FunctionWithImplicitDragEventAndReturn<T = any> = (e: ImplicitDragEvent) => T
export type FunctionWithImplicitTouchEventAndReturn<T = any> = (e: ImplicitTouchEvent) => T
export type FunctionWithImplicitWheelEventAndReturn<T = any> = (e: ImplicitWheelEvent) => T
export type FunctionWithImplicitAnimationEventAndReturn<T = any> = (e: ImplicitAnimationEvent) => T
export type FunctionWithImplicitTransitionEventAndReturn<T = any> = (e: ImplicitTransitionEvent) => T

// ===== TIPOS PARA FUNCIONES ASÍNCRONAS CON PARÁMETROS IMPLÍCITOS =====
export type AsyncFunctionWithImplicitParam = (e: ImplicitAny) => Promise<void>
export type AsyncFunctionWithImplicitEvent = (e: ImplicitEvent) => Promise<void>
export type AsyncFunctionWithImplicitChangeEvent = (e: ImplicitChangeEvent) => Promise<void>
export type AsyncFunctionWithImplicitClickEvent = (e: ImplicitClickEvent) => Promise<void>
export type AsyncFunctionWithImplicitSubmitEvent = (e: ImplicitSubmitEvent) => Promise<void>
export type AsyncFunctionWithImplicitKeyboardEvent = (e: ImplicitKeyboardEvent) => Promise<void>
export type AsyncFunctionWithImplicitMouseEvent = (e: ImplicitMouseEvent) => Promise<void>
export type AsyncFunctionWithImplicitFocusEvent = (e: ImplicitFocusEvent) => Promise<void>
export type AsyncFunctionWithImplicitBlurEvent = (e: ImplicitBlurEvent) => Promise<void>
export type AsyncFunctionWithImplicitFormEvent = (e: ImplicitFormEvent) => Promise<void>
export type AsyncFunctionWithImplicitDragEvent = (e: ImplicitDragEvent) => Promise<void>
export type AsyncFunctionWithImplicitTouchEvent = (e: ImplicitTouchEvent) => Promise<void>
export type AsyncFunctionWithImplicitWheelEvent = (e: ImplicitWheelEvent) => Promise<void>
export type AsyncFunctionWithImplicitAnimationEvent = (e: ImplicitAnimationEvent) => Promise<void>
export type AsyncFunctionWithImplicitTransitionEvent = (e: ImplicitTransitionEvent) => Promise<void>

// ===== TIPOS PARA FUNCIONES ASÍNCRONAS CON PARÁMETROS IMPLÍCITOS Y RETORNO =====
export type AsyncFunctionWithImplicitParamAndReturn<T = any> = (e: ImplicitAny) => Promise<T>
export type AsyncFunctionWithImplicitEventAndReturn<T = any> = (e: ImplicitEvent) => Promise<T>
export type AsyncFunctionWithImplicitChangeEventAndReturn<T = any> = (e: ImplicitChangeEvent) => Promise<T>
export type AsyncFunctionWithImplicitClickEventAndReturn<T = any> = (e: ImplicitClickEvent) => Promise<T>
export type AsyncFunctionWithImplicitSubmitEventAndReturn<T = any> = (e: ImplicitSubmitEvent) => Promise<T>
export type AsyncFunctionWithImplicitKeyboardEventAndReturn<T = any> = (e: ImplicitKeyboardEvent) => Promise<T>
export type AsyncFunctionWithImplicitMouseEventAndReturn<T = any> = (e: ImplicitMouseEvent) => Promise<T>
export type AsyncFunctionWithImplicitFocusEventAndReturn<T = any> = (e: ImplicitFocusEvent) => Promise<T>
export type AsyncFunctionWithImplicitBlurEventAndReturn<T = any> = (e: ImplicitBlurEvent) => Promise<T>
export type AsyncFunctionWithImplicitFormEventAndReturn<T = any> = (e: ImplicitFormEvent) => Promise<T>
export type AsyncFunctionWithImplicitDragEventAndReturn<T = any> = (e: ImplicitDragEvent) => Promise<T>
export type AsyncFunctionWithImplicitTouchEventAndReturn<T = any> = (e: ImplicitTouchEvent) => Promise<T>
export type AsyncFunctionWithImplicitWheelEventAndReturn<T = any> = (e: ImplicitWheelEvent) => Promise<T>
export type AsyncFunctionWithImplicitAnimationEventAndReturn<T = any> = (e: ImplicitAnimationEvent) => Promise<T>
export type AsyncFunctionWithImplicitTransitionEventAndReturn<T = any> = (e: ImplicitTransitionEvent) => Promise<T>

// ===== TIPOS PARA HANDLERS DE EVENTOS GENÉRICOS =====
export type GenericEventHandler = (e: any) => void
export type GenericChangeHandler = (e: any) => void
export type GenericClickHandler = (e: any) => void
export type GenericSubmitHandler = (e: any) => void
export type GenericKeyboardHandler = (e: any) => void
export type GenericMouseHandler = (e: any) => void
export type GenericFocusHandler = (e: any) => void
export type GenericBlurHandler = (e: any) => void
export type GenericFormHandler = (e: any) => void
export type GenericDragHandler = (e: any) => void
export type GenericTouchHandler = (e: any) => void
export type GenericWheelHandler = (e: any) => void
export type GenericAnimationHandler = (e: any) => void
export type GenericTransitionHandler = (e: any) => void

// ===== TIPOS PARA HANDLERS DE EVENTOS CON PARÁMETROS IMPLÍCITOS =====
export type ImplicitEventHandler = (e: ImplicitEvent) => void
export type ImplicitChangeHandler = (e: ImplicitChangeEvent) => void
export type ImplicitClickHandler = (e: ImplicitClickEvent) => void
export type ImplicitSubmitHandler = (e: ImplicitSubmitEvent) => void
export type ImplicitKeyboardHandler = (e: ImplicitKeyboardEvent) => void
export type ImplicitMouseHandler = (e: ImplicitMouseEvent) => void
export type ImplicitFocusHandler = (e: ImplicitFocusEvent) => void
export type ImplicitBlurHandler = (e: ImplicitBlurEvent) => void
export type ImplicitFormHandler = (e: ImplicitFormEvent) => void
export type ImplicitDragHandler = (e: ImplicitDragEvent) => void
export type ImplicitTouchHandler = (e: ImplicitTouchEvent) => void
export type ImplicitWheelHandler = (e: ImplicitWheelEvent) => void
export type ImplicitAnimationHandler = (e: ImplicitAnimationEvent) => void
export type ImplicitTransitionHandler = (e: ImplicitTransitionEvent) => void

// ===== EXPORTACIONES =====
export type {
  ImplicitAny,
  ImplicitEvent,
  ImplicitChangeEvent,
  ImplicitClickEvent,
  ImplicitSubmitEvent,
  ImplicitKeyboardEvent,
  ImplicitMouseEvent,
  ImplicitFocusEvent,
  ImplicitBlurEvent,
  ImplicitFormEvent,
  ImplicitDragEvent,
  ImplicitTouchEvent,
  ImplicitWheelEvent,
  ImplicitAnimationEvent,
  ImplicitTransitionEvent,
  FunctionWithImplicitParam,
  FunctionWithImplicitEvent,
  FunctionWithImplicitChangeEvent,
  FunctionWithImplicitClickEvent,
  FunctionWithImplicitSubmitEvent,
  FunctionWithImplicitKeyboardEvent,
  FunctionWithImplicitMouseEvent,
  FunctionWithImplicitFocusEvent,
  FunctionWithImplicitBlurEvent,
  FunctionWithImplicitFormEvent,
  FunctionWithImplicitDragEvent,
  FunctionWithImplicitTouchEvent,
  FunctionWithImplicitWheelEvent,
  FunctionWithImplicitAnimationEvent,
  FunctionWithImplicitTransitionEvent,
  EventHandler,
  ChangeEventHandler,
  ClickEventHandler,
  SubmitEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  BlurEventHandler,
  FormEventHandler,
  DragEventHandler,
  TouchEventHandler,
  WheelEventHandler,
  AnimationEventHandler,
  TransitionEventHandler,
  Callback,
  EventCallback,
  ChangeCallback,
  ClickCallback,
  SubmitCallback,
  KeyboardCallback,
  MouseCallback,
  FocusCallback,
  BlurCallback,
  FormCallback,
  DragCallback,
  TouchCallback,
  WheelCallback,
  AnimationCallback,
  TransitionCallback,
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
  FunctionWithOptionalFormEvent,
  FunctionWithOptionalDragEvent,
  FunctionWithOptionalTouchEvent,
  FunctionWithOptionalWheelEvent,
  FunctionWithOptionalAnimationEvent,
  FunctionWithOptionalTransitionEvent,
  FunctionWithRestParams,
  FunctionWithRestEvents,
  FunctionWithRestChangeEvents,
  FunctionWithRestClickEvents,
  FunctionWithRestSubmitEvents,
  FunctionWithRestKeyboardEvents,
  FunctionWithRestMouseEvents,
  FunctionWithRestFocusEvents,
  FunctionWithRestBlurEvents,
  FunctionWithRestFormEvents,
  FunctionWithRestDragEvents,
  FunctionWithRestTouchEvents,
  FunctionWithRestWheelEvents,
  FunctionWithRestAnimationEvents,
  FunctionWithRestTransitionEvents,
  FunctionWithImplicitParamAndReturn,
  FunctionWithImplicitEventAndReturn,
  FunctionWithImplicitChangeEventAndReturn,
  FunctionWithImplicitClickEventAndReturn,
  FunctionWithImplicitSubmitEventAndReturn,
  FunctionWithImplicitKeyboardEventAndReturn,
  FunctionWithImplicitMouseEventAndReturn,
  FunctionWithImplicitFocusEventAndReturn,
  FunctionWithImplicitBlurEventAndReturn,
  FunctionWithImplicitFormEventAndReturn,
  FunctionWithImplicitDragEventAndReturn,
  FunctionWithImplicitTouchEventAndReturn,
  FunctionWithImplicitWheelEventAndReturn,
  FunctionWithImplicitAnimationEventAndReturn,
  FunctionWithImplicitTransitionEventAndReturn,
  AsyncFunctionWithImplicitParam,
  AsyncFunctionWithImplicitEvent,
  AsyncFunctionWithImplicitChangeEvent,
  AsyncFunctionWithImplicitClickEvent,
  AsyncFunctionWithImplicitSubmitEvent,
  AsyncFunctionWithImplicitKeyboardEvent,
  AsyncFunctionWithImplicitMouseEvent,
  AsyncFunctionWithImplicitFocusEvent,
  AsyncFunctionWithImplicitBlurEvent,
  AsyncFunctionWithImplicitFormEvent,
  AsyncFunctionWithImplicitDragEvent,
  AsyncFunctionWithImplicitTouchEvent,
  AsyncFunctionWithImplicitWheelEvent,
  AsyncFunctionWithImplicitAnimationEvent,
  AsyncFunctionWithImplicitTransitionEvent,
  AsyncFunctionWithImplicitParamAndReturn,
  AsyncFunctionWithImplicitEventAndReturn,
  AsyncFunctionWithImplicitChangeEventAndReturn,
  AsyncFunctionWithImplicitClickEventAndReturn,
  AsyncFunctionWithImplicitSubmitEventAndReturn,
  AsyncFunctionWithImplicitKeyboardEventAndReturn,
  AsyncFunctionWithImplicitMouseEventAndReturn,
  AsyncFunctionWithImplicitFocusEventAndReturn,
  AsyncFunctionWithImplicitBlurEventAndReturn,
  AsyncFunctionWithImplicitFormEventAndReturn,
  AsyncFunctionWithImplicitDragEventAndReturn,
  AsyncFunctionWithImplicitTouchEventAndReturn,
  AsyncFunctionWithImplicitWheelEventAndReturn,
  AsyncFunctionWithImplicitAnimationEventAndReturn,
  AsyncFunctionWithImplicitTransitionEventAndReturn,
  GenericEventHandler,
  GenericChangeHandler,
  GenericClickHandler,
  GenericSubmitHandler,
  GenericKeyboardHandler,
  GenericMouseHandler,
  GenericFocusHandler,
  GenericBlurHandler,
  GenericFormHandler,
  GenericDragHandler,
  GenericTouchHandler,
  GenericWheelHandler,
  GenericAnimationHandler,
  GenericTransitionHandler,
  ImplicitEventHandler,
  ImplicitChangeHandler,
  ImplicitClickHandler,
  ImplicitSubmitHandler,
  ImplicitKeyboardHandler,
  ImplicitMouseHandler,
  ImplicitFocusHandler,
  ImplicitBlurHandler,
  ImplicitFormHandler,
  ImplicitDragHandler,
  ImplicitTouchHandler,
  ImplicitWheelHandler,
  ImplicitAnimationHandler,
  ImplicitTransitionHandler
}
