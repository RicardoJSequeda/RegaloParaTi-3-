'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import Autoplay from 'embla-carousel-autoplay'

export function InicioSection() {
  const anniversaryDate = '2023-02-03'
  const timeTogether = useTimeTogether(anniversaryDate)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  
  // Imágenes para el carrusel (10 fotos)
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
    },
    {
      id: 5,
      title: "Aventuras Compartidas",
      description: "Cada viaje es una nueva historia juntos",
      longDescription: "Explorando el mundo de la mano, creando recuerdos que durarán para siempre. Cada destino es especial porque lo compartimos juntos.",
      image: "/images/carrucel/02.jpg",
      date: "Aventuras Juntos"
    },
    {
      id: 6,
      title: "Risas y Alegría",
      description: "La felicidad se multiplica cuando estamos juntos",
      longDescription: "Cada risa, cada sonrisa, cada momento de alegría compartida es un tesoro que guardamos en nuestros corazones.",
      image: "/images/carrucel/03.jpg",
      date: "Momentos de Alegría"
    },
    {
      id: 7,
      title: "Celebraciones Especiales",
      description: "Cada ocasión es perfecta contigo",
      longDescription: "Celebrando la vida, el amor y cada momento especial. Contigo cada celebración se convierte en un recuerdo inolvidable.",
      image: "/images/carrucel/04.jpg",
      date: "Celebraciones"
    },
    {
      id: 8,
      title: "Paz y Tranquilidad",
      description: "Encontrando la calma en tu compañía",
      longDescription: "Los momentos más simples se vuelven extraordinarios cuando los compartimos. Tu presencia llena mi vida de paz y serenidad.",
      image: "/images/carrucel/05.jpg",
      date: "Momentos de Paz"
    },
    {
      id: 9,
      title: "Amor Eterno",
      description: "Un vínculo que crece cada día",
      longDescription: "Nuestro amor se fortalece con cada día que pasa. Eres mi compañera, mi mejor amiga, mi todo. Juntos construimos un futuro lleno de amor.",
      image: "/images/carrucel/06.jpg",
      date: "Amor Infinito"
    },
    {
      id: 10,
      title: "Sueños Compartidos",
      description: "Construyendo nuestro futuro juntos",
      longDescription: "Cada sueño, cada meta, cada proyecto es más hermoso cuando lo compartimos. Juntos podemos lograr cualquier cosa.",
      image: "/images/carrucel/07.jpg",
      date: "Nuestros Sueños"
    }
  ]

  // Configurar autoplay
  const autoplayPlugin = useCallback(
    () =>
      Autoplay({
        delay: 4000, // 4 segundos entre cada slide
        stopOnInteraction: false, // Continúa después de interacción
        stopOnMouseEnter: true, // Se pausa al pasar el mouse
      }),
    []
  )

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

  // UX: el grid de métricas se genera dinámicamente para mantener consistencia tipográfica y de spacing
  const counterItems = useMemo(
    () => [
      {
        id: 'years',
        label: 'AÑOS',
        value: timeTogether.years,
        gradient: 'from-pink-500 to-pink-600',
        delay: 0,
      },
      {
        id: 'months',
        label: 'MESES',
        value: timeTogether.months,
        gradient: 'from-pink-500 to-pink-600',
        delay: 0.03,
      },
      {
        id: 'days',
        label: 'DÍAS',
        value: timeTogether.days,
        gradient: 'from-pink-500 to-pink-600',
        delay: 0.06,
      },
      {
        id: 'hours',
        label: 'HORAS',
        value: timeTogether.hours,
        gradient: 'from-purple-500 to-purple-600',
        delay: 0.09,
      },
      {
        id: 'minutes',
        label: 'MIN',
        value: timeTogether.minutes,
        gradient: 'from-purple-500 to-purple-600',
        delay: 0.12,
      },
      {
        id: 'seconds',
        label: 'SEG',
        value: timeTogether.seconds,
        gradient: 'from-purple-500 to-purple-600',
        delay: 0.15,
      },
    ],
    [timeTogether]
  )

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-x-hidden px-3 pb-6 pt-3 sm:gap-6 sm:px-6 sm:pb-8 sm:pt-4 md:px-8 lg:pt-6 animate-in fade-in duration-500">
      {/* UX: encabezado centrado con tipografía escalable para jerarquía clara en mobile (320px+) */}
      <motion.div 
        className="flex flex-col items-center gap-1.5 text-center sm:gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Badge
          aria-hidden="true"
          variant="secondary"
          className="w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/70 backdrop-blur sm:px-3 sm:py-1 sm:text-[11px]"
        >
          Nuestra Historia
        </Badge>
        <h1 className="w-full text-wrap text-[1.5rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-[1.75rem] md:text-3xl">
          ¡Bienvenida a tu espacio especial!
        </h1>
        <p className="w-full max-w-xl px-1 text-[12px] leading-[1.5] text-gray-600 dark:text-gray-300 sm:text-[13px] sm:leading-5 md:text-sm md:leading-6">
          Aquí encontrarás todos nuestros recuerdos, mensajes y momentos especiales juntos.
        </p>
      </motion.div>

      <Separator className="mx-auto w-full max-w-md opacity-60" />

      {/* UX: tarjeta full-width optimizada para tacto y lectura en mobile (320px+) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="overflow-hidden rounded-xl border border-pink-100/70 bg-gradient-to-br from-white via-pink-50/50 to-white shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-pink-900/30 dark:from-gray-900 dark:via-gray-950/30 dark:to-gray-950 sm:rounded-2xl">
          <CardHeader className="flex flex-col gap-2 px-3 pb-2.5 pt-3 text-center sm:gap-3 sm:px-4 sm:pb-3 sm:pt-4 md:px-6">
            <CardTitle className="flex items-center justify-center gap-1.5 text-[15px] font-semibold text-gray-900 dark:text-white sm:gap-2 sm:text-base md:text-lg">
              <Heart aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-pink-500 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="whitespace-nowrap">Nuestro Tiempo Juntos</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs md:text-sm">
              Cada segundo contigo suma a nuestra historia de amor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 pt-0 sm:space-y-4 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
            {/* UX: Grid responsive que se adapta desde 320px - 3 columnas en móvil, 6 en desktop */}
            <div className="grid grid-cols-3 gap-x-1.5 gap-y-2.5 text-center sm:grid-cols-6 sm:gap-x-2 md:gap-x-3 md:gap-y-3">
              {counterItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-white/80 px-1 py-1.5 shadow-sm ring-1 ring-pink-100/80 backdrop-blur transition-all hover:shadow-md active:scale-95 dark:bg-gray-900/60 dark:ring-pink-900/30 sm:gap-1 sm:px-2 sm:py-2"
                  variants={counterVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: item.delay }}
                >
                  <span className={`bg-gradient-to-br ${item.gradient} bg-clip-text text-lg font-bold leading-none text-transparent sm:text-xl md:text-2xl`}>
                    <AnimatedCounter value={item.value} />
                  </span>
                  <span className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-gray-500 dark:text-gray-400 sm:text-[10px] md:text-[11px]">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
            {/* UX: Mensaje de aniversario con tipografía legible en móviles pequeños */}
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[12px] font-medium leading-relaxed text-gray-700 dark:text-gray-200 sm:text-sm">
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
                    Faltan <span className="text-sm font-bold text-pink-600 dark:text-pink-400 sm:text-base">{timeTogether.nextAnniversary.daysUntil}</span> días para nuestro próximo aniversario ❤️
                  </>
                )}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-[11px] md:text-xs">
                Próximo: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatNextAnniversary()}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* UX: carrusel optimizado para touch gestures con botones táctiles (mínimo 44x44px según Apple HIG) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="overflow-hidden rounded-xl border border-pink-100/80 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-pink-900/40 dark:bg-gray-900/80 sm:rounded-2xl">
          <CardHeader className="flex flex-col gap-1.5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 px-3 pb-2.5 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-4 sm:pb-3 sm:pt-4 md:px-6">
            <CardTitle className="flex items-center gap-1.5 text-base font-semibold text-gray-900 dark:text-white sm:gap-2 sm:text-lg md:text-xl">
              <Image aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-pink-500 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span className="whitespace-nowrap">Nuestros Momentos Especiales</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs md:text-sm">
              Desliza para revivirlos uno a uno.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0.5 pb-3 pt-2 sm:px-1 sm:pb-4 sm:pt-3 md:px-2 md:pb-6">
            <div className="relative">
              <Carousel
                setApi={setApi}
                plugins={[autoplayPlugin()]}
                opts={{
                  align: 'start',
                  loop: true,
                  slidesToScroll: 1,
                  dragFree: false,
                }}
                className="w-full touch-pan-y"
              >
                <CarouselContent className="-ml-0.5 min-h-[280px] snap-x snap-mandatory sm:-ml-1 sm:min-h-[320px] md:-ml-2">
                  {carouselImages.map((item, index) => (
                    <CarouselItem
                      key={item.id}
                      className="basis-full snap-center pl-0.5 sm:basis-1/2 sm:pl-1 md:pl-2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <motion.div
                        className="p-0.5 sm:p-1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/60 bg-white shadow-md ring-1 ring-gray-950/5 transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800/80 dark:bg-gray-900/80 dark:ring-white/10 sm:rounded-2xl">
                          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              showLoading={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-2 sm:gap-2 sm:p-3 md:p-4">
                              <Badge variant="secondary" className="inline-flex items-center gap-1 self-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-900 shadow-sm backdrop-blur transition-colors hover:bg-white active:scale-95 dark:bg-gray-950/90 dark:text-white dark:hover:bg-gray-900 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[11px]">
                                <Calendar aria-hidden="true" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="whitespace-nowrap">{item.date}</span>
                              </Badge>
                              <div className="text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <p className="text-xs font-semibold sm:text-sm">{item.title}</p>
                                <p className="text-[10px] font-medium text-white/80 sm:text-xs">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* UX: Botones táctiles con tamaño mínimo 44x44px (Apple HIG) para accesibilidad móvil */}
                <CarouselPrevious className="absolute left-1 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-pink-100/80 bg-white/95 p-0 shadow-lg backdrop-blur transition-all duration-200 active:scale-95 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 sm:left-2 sm:h-10 sm:w-10 md:left-3 dark:border-pink-900/40 dark:bg-gray-900/95 dark:hover:bg-gray-900" />
                <CarouselNext className="absolute right-1 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-pink-100/80 bg-white/95 p-0 shadow-lg backdrop-blur transition-all duration-200 active:scale-95 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 sm:right-2 sm:h-10 sm:w-10 md:right-3 dark:border-pink-900/40 dark:bg-gray-900/95 dark:hover:bg-gray-900" />
              </Carousel>
              <CarouselIndicators
                total={carouselImages.length}
                current={current}
                onSelect={(index) => api?.scrollTo(index)}
                className="mt-2 sm:mt-3"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </section>
  )
}
