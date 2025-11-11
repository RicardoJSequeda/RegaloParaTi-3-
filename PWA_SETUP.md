# Configuración PWA - DetalleParaTi

Esta aplicación está configurada como Progressive Web App (PWA) con las siguientes características:

## Características Implementadas

### ✅ Service Worker
- Caching de assets estáticos
- Estrategia Network First para páginas y APIs
- Estrategia Cache First para imágenes y recursos estáticos
- Funcionalidad offline básica
- Actualización automática del service worker

### ✅ Manifest
- Configuración completa del manifest
- Iconos para diferentes tamaños
- Shortcuts para acceso rápido
- Temas y colores personalizados

### ✅ Componentes PWA
- **InstallPrompt**: Muestra un prompt para instalar la app
- **ServiceWorkerRegistration**: Registra y maneja el service worker

### ✅ Metadatos
- Configuración completa en `layout.tsx`
- Soporte para iOS (Apple Web App)
- Viewport optimizado para móviles
- Theme color personalizado

## Iconos Requeridos

Para que la PWA funcione completamente, necesitas crear iconos en los siguientes tamaños:

- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px (mínimo requerido)
- 384x384px
- 512x512px (recomendado para pantalla de inicio)

### Generar Iconos

#### Opción 1: Script Automático
1. Crea un icono base de 512x512px y guárdalo como `public/icon-base.png`
2. Instala sharp: `npm install --save-dev sharp`
3. Ejecuta: `node scripts/generate-icons.js`

#### Opción 2: Herramientas Online
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generation)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

#### Opción 3: Manual
1. Crea un diseño de 512x512px
2. Exporta en los tamaños requeridos
3. Coloca los archivos en `public/icons/`

## Verificación

### En Desarrollo
1. Ejecuta `npm run build`
2. Ejecuta `npm start`
3. Abre las DevTools > Application > Service Workers
4. Verifica que el service worker esté registrado

### En Producción
1. Despliega la aplicación
2. Abre en un navegador móvil
3. Verifica que aparezca el prompt de instalación
4. Prueba la funcionalidad offline

## Testing

### Chrome DevTools
1. Abre Chrome DevTools
2. Ve a Application > Manifest
3. Verifica que el manifest esté cargado correctamente
4. Ve a Application > Service Workers
5. Verifica que el service worker esté activo
6. Ve a Application > Cache Storage
7. Verifica que los recursos estén en cache

### Lighthouse
1. Abre Chrome DevTools
2. Ve a Lighthouse
3. Ejecuta una auditoría PWA
4. Verifica que pase todas las pruebas

## Solución de Problemas

### Service Worker no se registra
- Verifica que estés en HTTPS (requerido para PWA)
- Verifica que el archivo `sw.js` esté en `public/`
- Verifica los headers en `next.config.js`

### Iconos no aparecen
- Verifica que los iconos estén en `public/icons/`
- Verifica que los tamaños sean correctos
- Verifica que las rutas en `manifest.ts` sean correctas

### Prompt de instalación no aparece
- Verifica que la app cumpla los criterios PWA
- Verifica que no esté ya instalada
- Verifica que el manifest esté correctamente configurado

## Próximos Pasos

1. Crear iconos personalizados
2. Personalizar la página offline
3. Agregar más shortcuts
4. Implementar sincronización en background
5. Agregar notificaciones push (opcional)

## Recursos

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Next.js - PWA](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)

