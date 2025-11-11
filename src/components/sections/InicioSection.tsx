'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Heart, Calendar, Image } from 'lucide-react'
import { useTimeTogether } from '@/hooks/useTimeTogether'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { CarouselIndicators } from '@/components/ui/carousel-indicators'
import { motion } from 'framer-motion'

export function InicioSection() {
  const anniversaryDate = '2023-02-03'
  const timeTogether = useTimeTogether(anniversaryDate)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  
  // Imágenes para el carrusel más grande
  const carouselImages = [
    {
      id: 1,
      title: "Nuestro Primer Encuentro",
      description: "El día que cambió nuestras vidas para siempre",
      longDescription: "3 de septiembre de 2024 - El momento mágico en que nuestros caminos se cruzaron. Una conexión instantánea que nos unió para siempre. Desde ese día, cada momento contigo ha sido extraordinario.",
      image: "/images/carrucel/19.jpg",
      date: "3 de Septiembre, 2024"
    },
    {
      id: 2,
      title: "Noche de Estrellas",
      description: "Bajo el cielo estrellado, nuestro amor brillaba más",
      longDescription: "7 de diciembre de 2024 - Una noche mágica donde las estrellas fueron testigos de nuestro amor. Cada momento contigo es un tesoro que guardo en mi corazón. Tu sonrisa ilumina mi mundo.",
      image: "/images/carrucel/01.jpg",
      date: "7 de Diciembre, 2024"
    },
    {
      id: 3,
      title: "Momentos de Felicidad",
      description: "Juntos creamos recuerdos inolvidables",
      longDescription: "8 de diciembre de 2024 - Cada día que pasa, nuestro amor se fortalece más. Eres mi compañera perfecta, mi confidente, mi todo. Contigo la vida es más hermosa y llena de significado.",
      image: "/images/carrucel/78.jpg",
      date: "8 de Diciembre, 2024"
    },
    {
      id: 4,
      title: "Nuestro Futuro Juntos",
      description: "Construyendo sueños y memorias para siempre",
      longDescription: "Un momento especial que captura la esencia de nuestro amor. Mirando hacia el futuro, veo un camino lleno de promesas, risas y momentos inolvidables. Contigo todo es posible y hermoso.",
      image: "/images/carrucel/20.jpg",
      date: "Nuestro Presente"
    }
  ]

  // Sincronizar el índice del carrusel
  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Función para formatear fecha del próximo aniversario (compacto)
  const formatNextAnniversary = () => {
    const date = timeTogether.nextAnniversary.date
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Animaciones para el contador
  const counterVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-500">
      {/* Header Ultra Compacto */}
      <motion.div 
        className="text-center py-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
          ¡Bienvenida a tu espacio especial!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-tight">
          Aquí encontrarás todos nuestros recuerdos, mensajes y momentos especiales juntos.
        </p>
      </motion.div>

      <Separator className="my-1.5" />

      {/* Contador de Tiempo Juntos Ultra Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="bg-gradient-to-br from-white to-pink-50/30 dark:from-gray-800 dark:to-gray-900/50 shadow-md border border-pink-100 dark:border-pink-900/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-2 pt-3 px-3">
            <CardTitle className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 fill-pink-500" />
              Nuestro Tiempo Juntos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 pb-3 pt-1">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 text-center">
              <motion.div 
                className="space-y-0.5"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-pink-500 to-pink-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.years} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">AÑOS</div>
              </motion.div>
              <motion.div 
                className="space-y-0.5"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.03 }}
              >
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-pink-500 to-pink-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.months} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">MESES</div>
              </motion.div>
              <motion.div 
                className="space-y-0.5"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.06 }}
              >
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-pink-500 to-pink-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.days} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">DÍAS</div>
              </motion.div>
              <motion.div 
                className="space-y-0.5"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.09 }}
              >
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.hours} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">HORAS</div>
              </motion.div>
              <motion.div 
                className="space-y-0.5"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.12 }}
              >
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.minutes} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">MIN</div>
              </motion.div>
              <motion.div 
                className="space-y-0.5"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15 }}
              >
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.seconds} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">SEG</div>
              </motion.div>
            </div>
            <div className="text-center mt-2 space-y-0.5">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                {timeTogether.nextAnniversary.daysUntil === 0 ? (
                  <span className="text-pink-600 dark:text-pink-400">
                    ¡Hoy es nuestro aniversario! 🎉❤️
                  </span>
                ) : timeTogether.nextAnniversary.daysUntil === 1 ? (
                  <span className="text-pink-600 dark:text-pink-400">
                    ¡Mañana es nuestro aniversario! ❤️
                  </span>
                ) : (
                  <>
                    Faltan <span className="text-pink-600 dark:text-pink-400 font-bold text-base">{timeTogether.nextAnniversary.daysUntil}</span> días para nuestro próximo aniversario ❤️
                  </>
                )}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                Próximo: {formatNextAnniversary()}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Carrusel de Fotos Especiales Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-md border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 pt-3 px-3 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              <Image className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
              Nuestros Momentos Especiales
            </CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-2 pb-3 pt-2">
            <div className="relative">
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-1 md:-ml-2">
                  {carouselImages.map((item, index) => (
                    <CarouselItem key={item.id} className="pl-1 md:pl-2 basis-full sm:basis-1/2 lg:basis-1/4">
                      <motion.div
                        className="p-1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer">
                          <div className="aspect-[4/5] sm:aspect-[3/4] relative overflow-hidden">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              showLoading={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-center">
                              <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white border-white/30 text-[10px] sm:text-xs px-2 py-1 shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors">
                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5" />
                                {item.date}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 shadow-md border-0 rounded-full transition-all duration-200 z-10 hover:scale-105" />
                <CarouselNext className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 shadow-md border-0 rounded-full transition-all duration-200 z-10 hover:scale-105" />
              </Carousel>
              <CarouselIndicators
                total={carouselImages.length}
                current={current}
                onSelect={(index) => api?.scrollTo(index)}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
