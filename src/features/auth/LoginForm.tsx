'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Heart, Sun, Moon } from 'lucide-react'
import { validateAnniversaryDate } from '@/lib/auth'
import { ERROR_MESSAGES } from '@/utils/constants'

interface LoginFormProps {
  onLogin: (date: string) => void
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

export function LoginForm({ onLogin, onToggleDarkMode, isDarkMode }: LoginFormProps) {
  const [anniversaryDate, setAnniversaryDate] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateAnniversaryDate(anniversaryDate)) {
      setError(false)
      onLogin(anniversaryDate)
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-3 sm:p-4">
      <Button
        onClick={onToggleDarkMode}
        variant="outline"
        size="icon"
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 h-10 w-10 sm:h-12 sm:w-12"
      >
        {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
      </Button>

      <Card className="w-full max-w-sm sm:max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
        <CardHeader className="text-center pb-6 sm:pb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full">
              <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            ¡Bienvenida Amor!
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2">
            Ingresa nuestra fecha de aniversario para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <label htmlFor="anniversaryDate" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Fecha de Aniversario:
              </label>
              <Input
                id="anniversaryDate"
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                required
                className="w-full h-10 sm:h-12 text-center text-base sm:text-lg border-2 border-pink-200 focus:border-pink-500 dark:border-gray-600 dark:focus:border-pink-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 sm:h-12 text-base sm:text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Heart className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Ingresar
            </Button>
          </form>

          {error && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-center text-base sm:text-lg font-medium">
                {ERROR_MESSAGES.INVALID_DATE}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
