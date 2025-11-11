# Guía de Instalación PWA - DetalleParaTi

## ¿Cuándo aparece el prompt de instalación?

El prompt de instalación aparece automáticamente cuando se cumplen estas condiciones:

### ✅ Condiciones Necesarias

1. **HTTPS o Localhost**: La app debe estar en HTTPS (o localhost para desarrollo)
2. **Manifest válido**: El manifest debe estar correctamente configurado
3. **Service Worker registrado**: El service worker debe estar activo
4. **Iconos**: Los iconos deben estar presentes (al menos el de 192x192px)
5. **Navegador compatible**: Chrome, Edge, Samsung Internet (Android) o Safari (iOS)

### 📱 Comportamiento por Plataforma

#### Chrome/Edge (Android/Windows)
- El prompt aparece automáticamente después de algunas interacciones
- Se muestra un banner en la barra de direcciones
- También aparece el evento `beforeinstallprompt` que nuestro componente captura

#### Safari (iOS)
- No hay evento `beforeinstallprompt` automático
- El usuario debe usar el menú de compartir manualmente
- Nuestro componente muestra instrucciones para iOS

#### Firefox
- Soporte limitado para PWA
- El usuario puede instalar desde el menú

## 🧪 Probar en Desarrollo

### Opción 1: Build de Producción Local
```bash
npm run build
npm start
```
Luego abre `http://localhost:3000` (el service worker funcionará en localhost)

### Opción 2: Usar HTTPS Local
Puedes usar herramientas como:
- [mkcert](https://github.com/FiloSottile/mkcert) para crear certificados locales
- [ngrok](https://ngrok.com/) para crear un túnel HTTPS

### Opción 3: Verificar en DevTools
1. Abre Chrome DevTools
2. Ve a Application > Manifest
3. Verifica que el manifest esté cargado
4. Ve a Application > Service Workers
5. Verifica que el service worker esté activo
6. Ve a Lighthouse > PWA
7. Ejecuta la auditoría para ver qué falta

## 🔍 Verificar que Funciona

### En Chrome DevTools:
1. **Application > Manifest**
   - ✅ Debe mostrar "Add to homescreen is available"
   - ✅ Debe listar todos los iconos

2. **Application > Service Workers**
   - ✅ Debe mostrar el service worker como "activated and is running"
   - ✅ El estado debe ser "activated"

3. **Console**
   - ✅ Debe mostrar: `[Service Worker] Registered successfully`
   - ✅ Si hay `beforeinstallprompt`, debe aparecer en el log

### Verificar el Prompt:
- El prompt aparece automáticamente en Chrome/Edge después de algunas interacciones
- También aparece nuestro componente personalizado después de 5 segundos (en desarrollo)
- En iOS, aparece un card con instrucciones

## 🐛 Solución de Problemas

### El prompt no aparece

1. **Verifica HTTPS**: Debe estar en HTTPS (excepto localhost)
2. **Verifica el manifest**: Abre `/manifest.webmanifest` en el navegador
3. **Verifica el service worker**: Debe estar registrado y activo
4. **Verifica los iconos**: Al menos el de 192x192px debe existir
5. **Limpia el cache**: Limpia el cache del navegador y recarga
6. **Verifica que no esté instalada**: Si ya está instalada, el prompt no aparecerá

### El service worker no se registra

1. **Verifica la ruta**: El archivo `sw.js` debe estar en `public/sw.js`
2. **Verifica HTTPS**: El service worker solo funciona en HTTPS o localhost
3. **Revisa la consola**: Debe mostrar errores si hay problemas
4. **Desregistra service workers antiguos**: Ve a Application > Service Workers y desregístralos

### Los iconos no aparecen

1. **Verifica las rutas**: Los iconos deben estar en `public/icons/`
2. **Verifica los tamaños**: Deben tener los tamaños exactos
3. **Verifica el formato**: Deben ser PNG
4. **Regenera los iconos**: Usa el script `generate-icons.js` o herramientas online

## 📝 Notas Importantes

- El prompt de instalación es controlado por el navegador, no podemos forzarlo
- Chrome/Edge muestran el prompt automáticamente después de ciertas condiciones
- Safari (iOS) requiere intervención manual del usuario
- El componente `InstallPrompt` captura el evento `beforeinstallprompt` cuando está disponible
- En desarrollo, el componente puede mostrar instrucciones aunque no haya `beforeinstallprompt`

## 🚀 Próximos Pasos

1. ✅ Crear los iconos (ver `public/icons/README.md`)
2. ✅ Desplegar en producción con HTTPS
3. ✅ Verificar con Lighthouse PWA audit
4. ✅ Probar en diferentes dispositivos y navegadores

