# 💕 RegaloParaTi - Aplicación de Amor

Una aplicación web especial diseñada para parejas, donde pueden guardar y revivir todos sus momentos especiales juntos. Desde recuerdos y fotos hasta planes futuros y metas compartidas.

## ✨ Características Principales

### 📱 Módulos Disponibles

- **🏠 Inicio**: Contador de tiempo juntos, carrusel de momentos especiales
- **📸 Recuerdos**: Gestión de momentos especiales con categorías y tags
- **💌 Mensajes Especiales**: Crear y guardar mensajes de amor
- **🎵 Nuestra Música**: Lista de canciones especiales con reproductor
- **🎁 Sorpresa**: Cajas sorpresa con sistema de desbloqueo
- **🎁 Regalos**: Registro de regalos y sorpresas recibidas
- **📖 Diario**: Entradas de diario para recordar momentos
- **🍳 Recetas**: Colección de recetas favoritas
- **🎬 Películas y Series**: Lista y recomendaciones
- **📅 Planes**: Gestión de eventos y planes futuros
- **📷 Fotos**: Galería completa con categorías
- **🐾 Mascotas**: Gestión completa de mascotas (cuidados, salud, gastos)
- **🎯 Metas y Sueños**: Objetivos compartidos con seguimiento de progreso

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **UI Components**: Radix UI
- **Animaciones**: Framer Motion
- **Estado**: Zustand
- **Mapas**: Leaflet
- **Deployment**: Vercel

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/regaloparati.git
cd regaloparati
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` y crea `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_ANNIVERSARY_DATE=2023-02-03
```

### 4. Configurar Supabase

1. Crea un proyecto en [Supabase](https://app.supabase.com)
2. Ejecuta las migraciones SQL para crear las tablas necesarias (ver sección de Base de Datos)
3. Configura el almacenamiento para imágenes si es necesario

### 5. Ejecutar en desarrollo

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗄️ Base de Datos

### Tablas Principales

El proyecto utiliza las siguientes tablas en Supabase:

- `diary_entries` - Entradas del diario
- `messages` - Mensajes especiales
- `gifts` - Regalos
- `recipes` - Recetas
- `movies` - Películas y series
- `photos` - Fotos y videos
- `places` - Lugares visitados y por visitar
- `plans` - Planes y eventos
- `surprises` - Cajas sorpresa
- `milestones` - Hitos importantes
- `goals` - Metas
- `dreams` - Sueños
- `curiosities` - Curiosidades

### Scripts de Migración

Ejecuta los scripts SQL en tu proyecto de Supabase para crear las tablas. (Ver carpeta `supabase/migrations` si existe)

## 🔐 Autenticación

Actualmente la aplicación utiliza un sistema de autenticación básico basado en validación de fecha de aniversario. Para producción, se recomienda implementar autenticación real con Supabase Auth.

## 📦 Build para Producción

```bash
npm run build
# o
yarn build
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio de GitHub con Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push a la rama principal

### Variables de Entorno en Vercel

Asegúrate de configurar todas las variables de entorno en el panel de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ANNIVERSARY_DATE`

## 📁 Estructura del Proyecto

```
regaloparati/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   └── page.tsx        # Página principal
│   ├── components/         # Componentes React
│   │   ├── sections/      # Secciones de la app
│   │   └── ui/            # Componentes UI reutilizables
│   ├── features/          # Features organizadas
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilidades y configuraciones
│   ├── server/            # Código del servidor
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades
├── public/                # Archivos estáticos
└── package.json
```

## 🧪 Testing

```bash
npm run test
# o
yarn test
```

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y personal.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial*

## 🙏 Agradecimientos

- Next.js Team
- Supabase Team
- Radix UI
- Todos los contribuyentes de las librerías open source utilizadas

## 📞 Soporte

Para soporte, envía un email a tu-email@ejemplo.com o abre un issue en GitHub.

---

Hecho con ❤️ para parejas especiales

