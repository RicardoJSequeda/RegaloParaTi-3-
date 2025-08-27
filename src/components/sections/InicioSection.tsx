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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mobile-text">¡Bienvenida a tu espacio especial!</h1>
        <p className="text-sm sm:text-base text-muted-foreground mobile-text">
          Aquí encontrarás todos nuestros recuerdos, mensajes y momentos especiales juntos.
        </p>
      </div>

      <Separator />

      {/* Contador de Tiempo Juntos */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mobile-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl mobile-text">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Nuestro Tiempo Juntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 text-center mobile-counter">
            <div className="space-y-1 sm:space-y-2 mobile-counter-item">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{timeTogether.years}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">AÑOS</div>
            </div>
            <div className="space-y-1 sm:space-y-2 mobile-counter-item">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{timeTogether.months}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">MESES</div>
            </div>
            <div className="space-y-1 sm:space-y-2 mobile-counter-item">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{timeTogether.days}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">DÍAS</div>
            </div>
            <div className="space-y-1 sm:space-y-2 mobile-counter-item">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{timeTogether.hours}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">HORAS</div>
            </div>
            <div className="space-y-1 sm:space-y-2 mobile-counter-item">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{timeTogether.minutes}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">MIN</div>
            </div>
            <div className="space-y-1 sm:space-y-2 mobile-counter-item">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{timeTogether.seconds}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">SEG</div>
            </div>
          </div>
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-sm sm:text-lg text-muted-foreground mobile-text">
              Faltan {365 - (timeTogether.days + timeTogether.months * 30)} días para nuestro próximo aniversario ❤️❤️❤️
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Carrusel de Fotos Especiales */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl mobile-text">
            <Image className="h-5 w-5 text-primary" />
            Nuestros Momentos Especiales
          </CardTitle>
          <CardDescription className="mobile-text">
            Revive los momentos más hermosos de nuestra historia juntos
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <div className="p-1">
                      <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 carousel-item">
                        <div className="aspect-[4/5] relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 mobile-media"
                          />
                          <div className="absolute inset-0 carousel-image-overlay" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white carousel-description">
                            <h3 className="font-bold text-lg sm:text-xl mb-2 mobile-text carousel-title carousel-text-shadow">{item.title}</h3>
                            <p className="text-sm sm:text-base opacity-95 mb-2 mobile-text carousel-subtitle carousel-text-shadow">{item.description}</p>
                            <p className="text-xs sm:text-sm opacity-90 leading-relaxed mb-3 hidden sm:block mobile-text carousel-long-description carousel-text-shadow">{item.longDescription}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs sm:text-sm mobile-touch-target carousel-badge">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
              <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 mobile-carousel-control bg-white/80 hover:bg-white" />
              <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 mobile-carousel-control bg-white/80 hover:bg-white" />
            </Carousel>
          </div>
        </CardContent>
      </Card>

      {/* Nuestro Rincón de Amor */}
      <Card className="bg-gradient-to-r from-secondary/5 to-accent/5 border-secondary/20 mobile-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 mobile-text">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            Nuestro Rincón de Amor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base sm:text-lg leading-relaxed text-center mobile-text">
            Este es nuestro espacio especial para guardar y revivir todos los momentos mágicos que hemos compartido juntos. 
            Cada foto, cada mensaje y cada canción es un tesoro que nos recuerda lo especial que es nuestro amor.
          </p>
          <div className="text-center">
            <blockquote className="text-base sm:text-lg italic text-muted-foreground mobile-text">
              "El amor no se mide por cuánto tiempo lo has esperado, sino por cuánto estás dispuesto a esperar por él."
            </blockquote>
          </div>
        </CardContent>
      </Card>




    </div>
  )
}
