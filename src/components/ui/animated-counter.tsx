'use client'

import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  className?: string
  duration?: number
}

export function AnimatedCounter({ value, className, duration = 500 }: AnimatedCounterProps) {
  // Mostrar valor directamente sin animación para evitar movimiento del layout
  const displayValue = value

  return (
    <span 
      className={cn('inline-block text-center tabular-nums', className)}
      style={{ 
        minWidth: '3ch', 
        maxWidth: '3ch',
        width: '3ch',
        display: 'inline-block',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        position: 'relative'
      }}
    >
      {displayValue}
    </span>
  )
}

