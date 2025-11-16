'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Heart, Calendar, Image } from 'lucide-react'
import { useTimeTogether } from '@/hooks/useTimeTogether'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { CarouselIndicators } from '@/components/ui/carousel-indicators'
import Autoplay from 'embla-carousel-autoplay'

// Componente contador que actualiza solo el número sin re-renderizar el layout
const CounterItem = ({ item, index }: { item: { id: string; label: string; value: number; gradient: string }; index: number }) => {
  const numberRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(item.value)
  
  // Actualizar solo el texto del número sin re-renderizar
  useEffect(() => {
    if (numberRef.current && prevValueRef.current !== item.value) {
      numberRef.current.textContent = String(item.value)
      prevValueRef.current = item.value
    }
  }, [item.value])
  
  return (
    <div
      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border border-pink-200 bg-white px-1.5 py-2 shadow-sm dark:border-pink-800 dark:bg-gray-900 overflow-hidden ${index >= 3 ? 'hidden md:flex' : ''}`}
      style={{ 
        minWidth: 0, 
        maxWidth: '100%', 
        width: '100%', 
        contain: 'layout style paint',
        willChange: 'auto',
        position: 'relative',
        flexShrink: 0
      }}
    >
      <div 
        className="w-full flex justify-center items-center overflow-hidden" 
        style={{ 
          minHeight: '1.5rem', 
          maxHeight: '1.5rem',
          maxWidth: '100%', 
          contain: 'layout paint',
          willChange: 'auto',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <span 
          ref={numberRef}
          className={`bg-gradient-to-br ${item.gradient} bg-clip-text text-lg font-bold leading-none text-transparent tabular-nums`} 
          style={{ 
            display: 'inline-block', 
            minWidth: '2ch', 
            maxWidth: '2ch',
            width: '2ch',
            textAlign: 'center',
            contain: 'layout paint',
            willChange: 'auto',
            position: 'relative',
            flexShrink: 0,
            lineHeight: '1.2',
            height: '1.2em'
          }}
        >
          {item.value}
        </span>
      </div>
      <span 
        className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-gray-600 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ contain: 'layout paint' }}
      >
        {item.label}
      </span>
    </div>
  )
}

export function InicioSection() {
  const anniversaryDate = '2023-02-03'
  const timeTogether = useTimeTogether(anniversaryDate)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  
  // Imágenes para el carrusel (10 fotos)
  const carouselImages = useMemo(() => [
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
  ], [])

  // Configurar autoplay - optimizado para evitar cambios de layout
  const autoplayPlugin = useCallback(
    () =>
      Autoplay({
        delay: 6000, // 6 segundos entre cada slide
        stopOnInteraction: true, // Se detiene después de interacción
        stopOnMouseEnter: true, // Se pausa al pasar el mouse
        stopOnFocusIn: true, // Se detiene al enfocar
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
  const formatNextAnniversary = useCallback(() => {
    const date = timeTogether.nextAnniversary.date
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }, [timeTogether.nextAnniversary.date])

  // UX: el grid de métricas - ESTABLE: solo se recalcula cuando cambian valores significativos
  const counterItems = useMemo(
    () => [
      {
        id: 'years',
        label: 'AÑOS',
        value: timeTogether.years,
        gradient: 'from-pink-500 to-pink-600',
      },
      {
        id: 'months',
        label: 'MESES',
        value: timeTogether.months,
        gradient: 'from-pink-500 to-pink-600',
      },
      {
        id: 'days',
        label: 'DÍAS',
        value: timeTogether.days,
        gradient: 'from-pink-500 to-pink-600',
      },
      {
        id: 'hours',
        label: 'HORAS',
        value: timeTogether.hours,
        gradient: 'from-purple-500 to-purple-600',
      },
      {
        id: 'minutes',
        label: 'MIN',
        value: timeTogether.minutes,
        gradient: 'from-purple-500 to-purple-600',
      },
      {
        id: 'seconds',
        label: 'SEG',
        value: timeTogether.seconds,
        gradient: 'from-purple-500 to-purple-600',
      },
    ],
    [timeTogether.years, timeTogether.months, timeTogether.days, timeTogether.hours, timeTogether.minutes, timeTogether.seconds]
  )

  // Fijar dimensiones del section y grid después del primer render - SOLUCIÓN DEFINITIVA
  useEffect(() => {
    if (sectionRef.current && gridRef.current) {
      const section = sectionRef.current
      const grid = gridRef.current
      
      // Esperar a que el layout se estabilice
      const timeoutId = setTimeout(() => {
        // Fijar dimensiones del grid
        const gridWidth = grid.offsetWidth
        const gridHeight = grid.offsetHeight
        if (gridWidth > 0 && gridHeight > 0) {
          grid.style.width = `${gridWidth}px`
          grid.style.minHeight = `${gridHeight}px`
          grid.style.maxHeight = `${gridHeight}px`
        }
        
        // Fijar ancho del section
        const sectionWidth = section.offsetWidth
        if (sectionWidth > 0) {
          section.style.width = `${sectionWidth}px`
          section.style.maxWidth = `${sectionWidth}px`
        }
      }, 100) // Pequeño delay para asegurar que el layout esté estable
      
      return () => clearTimeout(timeoutId)
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-x-hidden px-0 pb-6 pt-3 md:px-6" 
      style={{ 
        minWidth: 0, 
        contain: 'layout style', 
        willChange: 'auto',
        position: 'relative'
      }}
    >
      {/* UX: encabezado */}
      <div className="flex flex-col items-center gap-1.5 text-center w-full px-3" style={{ minWidth: 0, maxWidth: '100%' }}>
        <Badge
          aria-hidden="true"
          variant="secondary"
          className="w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/70 backdrop-blur"
        >
          Nuestra Historia
        </Badge>
        <h1 className="w-full max-w-full text-wrap text-[1.5rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white px-0">
          Bienvenida a tu espacio especial
        </h1>
        <p className="w-full max-w-2xl text-[12px] leading-[1.5] text-gray-600 dark:text-gray-300 px-0">
          Aquí encontrarás todos nuestros recuerdos, mensajes y momentos especiales juntos.
        </p>
      </div>

      {/* UX: tarjeta */}
      <div className="w-full" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
        <Card className="overflow-hidden rounded-xl border-0 bg-white shadow-lg dark:bg-gray-800" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
          <CardHeader className="flex flex-col gap-2 px-3 pb-2.5 pt-3">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
              <Heart aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-pink-500" />
              <span>Nuestro Tiempo Juntos</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-600 dark:text-gray-400">
              Cada segundo contigo suma a nuestra historia de amor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
            {/* UX: Grid - 3 columnas en móvil (solo primeros 3), 6 en tablet/desktop - SOLUCIÓN DEFINITIVA */}
            <div 
              ref={gridRef}
              className="grid grid-cols-3 gap-1.5 text-center overflow-hidden md:grid-cols-6" 
              style={{ 
                maxWidth: '100%', 
                minWidth: 0, 
                contain: 'layout style paint', 
                willChange: 'auto',
                position: 'relative',
                isolation: 'isolate'
              }}
            >
              {counterItems.map((item, index) => (
                <CounterItem key={item.id} item={item} index={index} />
              ))}
            </div>
            {/* UX: Mensaje de aniversario */}
            <div className="flex flex-col items-center gap-1 text-center pt-1.5">
              <p className="text-xs font-medium leading-relaxed text-gray-700 dark:text-gray-200">
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
                    Faltan <span className="text-sm font-bold text-pink-600 dark:text-pink-400">{timeTogether.nextAnniversary.daysUntil}</span> días para nuestro próximo aniversario <Heart className="inline h-3 w-3 text-pink-500" />
                  </>
                )}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Próximo: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatNextAnniversary()}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UX: carrusel */}
      <div className="w-full" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
        <Card className="overflow-hidden rounded-xl border-0 bg-white shadow-lg dark:bg-gray-800" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
          <CardHeader className="flex flex-col gap-2 px-3 pb-2.5 pt-3">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
              <Image aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-pink-500" />
              <span>Nuestros Momentos Especiales</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-600 dark:text-gray-400">
              Desliza para revivirlos uno a uno.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-3 pt-0 md:px-3" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
            <div className="relative overflow-hidden" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
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
                style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}
              >
                <CarouselContent className="min-h-[350px] snap-x snap-mandatory md:min-h-[400px]" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
                  {carouselImages.map((item, index) => (
                    <CarouselItem
                      key={item.id}
                      className="basis-full snap-center pl-0 md:basis-1/3 lg:basis-1/4"
                      style={{ minWidth: 0, contain: 'layout style', willChange: 'auto' }}
                    >
                      <div className="w-full px-3 md:px-2" style={{ minWidth: 0, maxWidth: '100%', contain: 'layout style', willChange: 'auto' }}>
                        <div className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-900" style={{ contain: 'layout style', willChange: 'auto' }}>
                          <div className="relative aspect-[3/4] overflow-hidden rounded-lg" style={{ contain: 'layout style', willChange: 'auto' }}>
                            <ImageWithFallback
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              showLoading={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
                              <Badge variant="secondary" className="inline-flex items-center gap-1 self-center rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-gray-900 shadow-md backdrop-blur dark:bg-gray-900/95 dark:text-white">
                                <Calendar aria-hidden="true" className="h-2.5 w-2.5" />
                                <span>{item.date}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* UX: Botones táctiles */}
                <CarouselPrevious className="absolute left-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border-0 bg-white/95 p-0 shadow-xl backdrop-blur dark:bg-gray-900/95" />
                <CarouselNext className="absolute right-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border-0 bg-white/95 p-0 shadow-xl backdrop-blur dark:bg-gray-900/95" />
              </Carousel>
              <CarouselIndicators
                total={carouselImages.length}
                current={current}
                onSelect={(index) => api?.scrollTo(index)}
                className="mt-3"
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </section>
  )
}
