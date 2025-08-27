'use client'

import { FloatingHeart } from '@/types'

interface FloatingHeartsProps {
  hearts: FloatingHeart[]
}

export function FloatingHearts({ hearts }: FloatingHeartsProps) {
  return (
    <>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart fixed pointer-events-none z-50"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            width: '30px',
            height: '30px',
            background: 'hsl(var(--primary))',
            transform: 'rotate(45deg)',
            opacity: 0,
            animation: 'floatHearts 5s infinite ease-in',
          }}
        >
          <div
            className="absolute w-[30px] h-[30px] rounded-full"
            style={{
              left: '0',
              top: '-15px',
              background: 'hsl(var(--primary))',
            }}
          />
          <div
            className="absolute w-[30px] h-[30px] rounded-full"
            style={{
              top: '0',
              left: '15px',
              background: 'hsl(var(--primary))',
            }}
          />
        </div>
      ))}
    </>
  )
}
