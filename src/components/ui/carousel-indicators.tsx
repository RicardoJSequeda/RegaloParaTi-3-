'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface CarouselIndicatorsProps {
  total: number
  current: number
  onSelect: (index: number) => void
  className?: string
}

export function CarouselIndicators({ total, current, onSelect, className }: CarouselIndicatorsProps) {
  if (total <= 1) return null

  return (
    <div className={cn('flex justify-center gap-2 mt-4', className)}>
      {Array.from({ length: total }).map((_, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          className={cn(
            'h-2 w-8 p-0 rounded-full transition-all duration-300',
            current === index
              ? 'bg-pink-500 w-8'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
          )}
          onClick={() => onSelect(index)}
          aria-label={`Ir a slide ${index + 1}`}
        />
      ))}
    </div>
  )
}

