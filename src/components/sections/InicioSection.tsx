'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Heart, Calendar, Image } from 'lucide-react'
import { useTimeTogether } from '@/hooks/useTimeTogether'

export function InicioSection() {
  const anniversaryDate = '2023-02-03'
  const timeTogether = useTimeTogether(anniversaryDate)
  
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

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
          ¡Bienvenida a tu espacio especial!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Aquí encontrarás todos nuestros recuerdos, mensajes y momentos especiales juntos.
        </p>
      </div>

      <Separator />

      {/* Contador de Tiempo Juntos */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            Nuestro Tiempo Juntos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-pink-500 leading-none">{timeTogether.years}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">AÑOS</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-pink-500 leading-none">{timeTogether.months}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">MESES</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-pink-500 leading-none">{timeTogether.days}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">DÍAS</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-pink-500 leading-none">{timeTogether.hours}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">HORAS</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-pink-500 leading-none">{timeTogether.minutes}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">MIN</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-pink-500 leading-none">{timeTogether.seconds}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">SEG</div>
            </div>
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
              Faltan {365 - (timeTogether.days + timeTogether.months * 30)} días para nuestro próximo aniversario ❤️❤️❤️
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Carrusel de Fotos Especiales */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            <Image className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            Nuestros Momentos Especiales
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Revive los momentos más hermosos de nuestra historia juntos
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6">
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {carouselImages.map((item) => (
                  <CarouselItem key={item.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div className="aspect-[4/5] relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="font-bold text-xl sm:text-2xl mb-3 text-shadow-lg">{item.title}</h3>
                            <p className="text-base sm:text-lg opacity-95 mb-3 text-shadow-md leading-relaxed">{item.description}</p>
                            <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-4 hidden sm:block text-shadow-sm">{item.longDescription}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                {item.date}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full transition-all duration-300" />
              <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full transition-all duration-300" />
            </Carousel>
          </div>
        </CardContent>
      </Card>

      {/* Nuestro Rincón de Amor */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            Nuestro Rincón de Amor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-8 space-y-6">
          <p className="text-base sm:text-lg leading-relaxed text-center text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
            Este es nuestro espacio especial para guardar y revivir todos los momentos mágicos que hemos compartido juntos. 
            Cada foto, cada mensaje y cada canción es un tesoro que nos recuerda lo especial que es nuestro amor.
          </p>
          <div className="text-center">
            <blockquote className="text-lg sm:text-xl italic text-pink-600 dark:text-pink-400 font-medium leading-relaxed max-w-3xl mx-auto">
              "El amor no se mide por cuánto tiempo lo has esperado, sino por cuánto estás dispuesto a esperar por él."
            </blockquote>
          </div>
        </CardContent>
      </Card>




    </div>
  )
}
