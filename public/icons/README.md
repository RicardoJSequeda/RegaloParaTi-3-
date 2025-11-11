# Iconos PWA

Este directorio contiene los iconos necesarios para la Progressive Web App (PWA).

## Tamaños requeridos

- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Generar iconos

### Opción 1: Usar el script de generación

1. Coloca una imagen base de 512x512px en `public/icon-base.png`
2. Instala sharp: `npm install --save-dev sharp`
3. Ejecuta: `node scripts/generate-icons.js`

### Opción 2: Generar manualmente

1. Crea un icono de 512x512px con tu diseño
2. Usa una herramienta como [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) o [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Coloca los iconos generados en este directorio

### Opción 3: Usar herramientas online

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

## Notas

- Los iconos deben ser PNG
- El icono de 192x192px es el mínimo requerido
- El icono de 512x512px es recomendado para la pantalla de inicio
- Los iconos deben tener fondo transparente o sólido
- Para mejor compatibilidad, usa iconos con "purpose: maskable any"

## Iconos temporales

Si no tienes iconos aún, puedes crear iconos temporales simples con un color de fondo y un emoji o texto.

