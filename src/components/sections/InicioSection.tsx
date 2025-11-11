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

  // Función para formatear fecha del próximo aniversario
  const formatNextAnniversary = () => {
    const date = timeTogether.nextAnniversary.date
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header Compacto */}
      <motion.div 
        className="space-y-2 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          ¡Bienvenida a tu espacio especial!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
          Aquí encontrarás todos nuestros recuerdos, mensajes y momentos especiales juntos.
        </p>
      </motion.div>

      <Separator className="my-4" />

      {/* Contador de Tiempo Juntos Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-white to-pink-50/30 dark:from-gray-800 dark:to-gray-900/50 shadow-lg border border-pink-100 dark:border-pink-900/30 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center pb-3 pt-4 px-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500 fill-pink-500" />
              Nuestro Tiempo Juntos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4 pt-2">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 text-center">
              <motion.div 
                className="space-y-1"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-pink-500 to-pink-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.years} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">AÑOS</div>
              </motion.div>
              <motion.div 
                className="space-y-1"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.05 }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-pink-500 to-pink-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.months} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">MESES</div>
              </motion.div>
              <motion.div 
                className="space-y-1"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-pink-500 to-pink-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.days} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">DÍAS</div>
              </motion.div>
              <motion.div 
                className="space-y-1"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15 }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.hours} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">HORAS</div>
              </motion.div>
              <motion.div 
                className="space-y-1"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.minutes} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">MIN</div>
              </motion.div>
              <motion.div 
                className="space-y-1"
                variants={counterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.25 }}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent leading-none">
                  <AnimatedCounter value={timeTogether.seconds} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">SEG</div>
              </motion.div>
            </div>
            <div className="text-center mt-4 space-y-1">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                {timeTogether.nextAnniversary.daysUntil === 0 ? (
                  <span className="text-pink-600 dark:text-pink-400">
                    ¡Hoy es nuestro aniversario! 🎉❤️🎉
                  </span>
                ) : timeTogether.nextAnniversary.daysUntil === 1 ? (
                  <span className="text-pink-600 dark:text-pink-400">
                    ¡Mañana es nuestro aniversario! ❤️❤️❤️
                  </span>
                ) : (
                  <>
                    Faltan <span className="text-pink-600 dark:text-pink-400 font-bold text-lg">{timeTogether.nextAnniversary.daysUntil}</span> días para nuestro próximo aniversario ❤️
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Próximo aniversario: {formatNextAnniversary()}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Carrusel de Fotos Especiales Mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-4 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
            <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <Image className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
              Nuestros Momentos Especiales
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Revive los momentos más hermosos de nuestra historia juntos
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-6">
            <div className="relative">
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {carouselImages.map((item, index) => (
                    <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <motion.div
                        className="p-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                          <div className="aspect-[4/5] relative overflow-hidden">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              showLoading={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-center">
                              <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white border-white/30 text-xs sm:text-sm px-3 py-1.5 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                {item.date}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 shadow-lg border-0 rounded-full transition-all duration-300 z-10 hover:scale-110" />
                <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 shadow-lg border-0 rounded-full transition-all duration-300 z-10 hover:scale-110" />
              </Carousel>
              <CarouselIndicators
                total={carouselImages.length}
                current={current}
                onSelect={(index) => api?.scrollTo(index)}
                className="mt-4"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
