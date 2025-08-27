'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './card'
import { Button } from './button'
import { 
  Gift, 
  Sparkles, 
  Heart, 
  Lock, 
  Unlock, 
  Calendar, 
  Key, 
  Clock,
  Star,
  Play,
  Image as ImageIcon,
  FileText,
  Video,
  MapPin,
  ExternalLink
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { SurpriseBox } from '@/types'

interface SurpriseCardProps {
  surprise: SurpriseBox
  onUnlock: (id: string) => void
  onOpen: (surprise: SurpriseBox) => void
  onRequestEdit?: (surprise: SurpriseBox) => void
  isUnlockable: boolean
  daysUntilUnlock?: number
  hoursUntilUnlock?: number
}

export function SurpriseCard({ 
  surprise, 
  onUnlock, 
  onOpen, 
  onRequestEdit,
  isUnlockable,
  daysUntilUnlock,
  hoursUntilUnlock 
}: SurpriseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyValue, setKeyValue] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showEditPrompt, setShowEditPrompt] = useState(false)
  const [editPassword, setEditPassword] = useState('')
  const [editError, setEditError] = useState('')

  // Frases misteriosas aleatorias para las sorpresas
  const mysteryPhrases = [
    "Una sorpresa llena de amor ❤️",
    "Una aventura te espera... ⭐",
    "Algo especial para ti 🎁",
    "Un momento mágico ✨",
    "Una sorpresa única 🌟",
    "Algo que te hará sonreír 😊",
    "Una sorpresa inesperada 🎉",
    "Un regalo especial 💝",
    "Una sorpresa romántica 💕",
    "Algo que te encantará 🥰",
    "Una sorpresa sorprendente 🎊",
    "Un momento especial 🌸",
    "Una sorpresa dulce 🍬",
    "Algo que te conmoverá 💖",
    "Una sorpresa perfecta 👑"
  ]

  // Seleccionar frase aleatoria basada en el ID de la sorpresa
  const getRandomPhrase = () => {
    const index = parseInt(surprise.id.replace(/\D/g, '')) % mysteryPhrases.length
    return mysteryPhrases[index]
  }



  const getUnlockTypeIcon = (type: string) => {
    switch (type) {
      case 'key':
        return <Key className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'sequential':
        return <Star className="h-4 w-4" />
      case 'free':
        return <Unlock className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const getUnlockTypeText = (type: string) => {
    switch (type) {
      case 'key':
        return 'Llave especial'
      case 'date':
        return 'Por fecha'
      case 'sequential':
        return 'Secuencial'
      case 'free':
        return 'Gratis'
      default:
        return 'Bloqueado'
    }
  }

  const handleUnlock = async () => {
    if (surprise.unlock_type === 'key') {
      setShowKeyInput(true)
      return
    }

    setIsUnlocking(true)
    
    // Efecto de confeti al desbloquear
    if (surprise.effects?.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }

    // Simular delay para efecto visual
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onUnlock(surprise.id)
    setIsUnlocking(false)
  }

  const handleKeySubmit = async () => {
    if (keyValue.trim() === '') return

    setIsUnlocking(true)

    // Verificar si la llave es correcta
    if (keyValue.trim().toUpperCase() === surprise.required_key?.toUpperCase()) {
      // Efecto de confeti
      if (surprise.effects?.confetti) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      onUnlock(surprise.id)
      setShowKeyInput(false)
      setKeyValue('')
    } else {
      // Efecto de error
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#dc2626']
      })
    }

    setIsUnlocking(false)
  }

  const formatTimeRemaining = () => {
    if (daysUntilUnlock && daysUntilUnlock > 0) {
      return `${daysUntilUnlock} día${daysUntilUnlock > 1 ? 's' : ''}`
    }
    if (hoursUntilUnlock && hoursUntilUnlock > 0) {
      return `${hoursUntilUnlock} hora${hoursUntilUnlock > 1 ? 's' : ''}`
    }
    return '¡Ya disponible!'
  }

  const handleEditRequest = () => {
    const ok = editPassword && editPassword === (surprise.edit_password || '')
    if (!ok) { 
      setEditError('Contraseña incorrecta')
      return 
    }
    onRequestEdit && onRequestEdit(surprise)
    setShowEditPrompt(false)
    setEditPassword('')
    setEditError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 h-64
        ${surprise.is_unlocked 
          ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-lg' 
          : 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200'
        }
        ${isHovered ? 'shadow-xl' : 'shadow-md'}
      `}>
        {/* Efecto de brillo en hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />

        <CardContent className="p-6 h-full flex flex-col">
          {/* Icono central de regalo */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              ${surprise.is_unlocked 
                ? 'bg-gradient-to-br from-pink-100 to-purple-100' 
                : 'bg-gradient-to-br from-gray-100 to-slate-100'
              }
            `}>
              <div className="text-3xl">🎁</div>
            </div>
            
            {/* Frase misteriosa */}
            <p className="text-center text-gray-700 font-medium mb-2">
              {getRandomPhrase()}
            </p>
          </div>

          {/* Botón de editar/eliminar (esquina superior derecha) */}
          <button
            onClick={() => {
              setShowEditPrompt(!showEditPrompt)
              if (showEditPrompt) {
                setEditPassword('')
                setEditError('')
              }
            }}
            className={`absolute top-3 right-3 p-2 rounded-lg border ${
              showEditPrompt 
                ? 'bg-gray-200 text-gray-700 border-gray-300' 
                : 'bg-white/80 text-gray-400 border-gray-200 hover:bg-gray-100'
            }`}
            title="Editar/Eliminar sorpresa"
          >
            <div className="text-sm">⚙️</div>
          </button>

          {/* Prompt de edición */}
          <AnimatePresence>
            {showEditPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-12 right-3 w-64 p-3 bg-white rounded-lg border border-gray-200 shadow-lg z-10"
              >
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">Contraseña de edición:</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => { setEditPassword(e.target.value); setEditError('') }}
                      placeholder="Ingresa la contraseña..."
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-pink-500 focus:ring-pink-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditRequest()
                        }
                      }}
                    />
                    <Button
                      onClick={handleEditRequest}
                      size="sm"
                      className="bg-gray-800 hover:bg-gray-900 text-xs px-3"
                    >
                      Editar
                    </Button>
                  </div>
                  {editError && (
                    <p className="text-xs text-red-500">{editError}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input para llave */}
          <AnimatePresence>
            {showKeyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                    placeholder="Llave..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleKeySubmit()}
                  />
                  <Button
                    onClick={handleKeySubmit}
                    disabled={isUnlocking}
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    {isUnlocking ? '...' : 'OK'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón principal */}
          <div className="mt-auto">
            {surprise.is_unlocked ? (
              <Button
                onClick={() => onOpen(surprise)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                ✨ Desbloqueado
              </Button>
            ) : (
              <Button
                onClick={handleUnlock}
                disabled={(
                  (surprise.unlock_type === 'date' && !isUnlockable) ||
                  (surprise.unlock_type === 'sequential' && !isUnlockable) ||
                  isUnlocking
                )}
                className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 border border-gray-300"
              >
                {isUnlocking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="mr-2">🔒</span>
                )}
                {isUnlocking ? 'Desbloqueando...' : 'Desbloquear'}
              </Button>
            )}
          </div>

          {/* Efectos especiales */}
          {surprise.effects?.confetti && surprise.is_unlocked && (
            <motion.div
              className="absolute top-2 right-2"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
