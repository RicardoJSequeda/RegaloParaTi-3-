# 🔗 Guía de Configuración de GitHub

Esta guía te ayudará a conectar tu proyecto con GitHub y configurar el deployment automático.

## 📋 Paso 1: Crear Repositorio en GitHub

1. Ve a [https://github.com](https://github.com)
2. Haz clic en el botón "New" o "New repository"
3. Configura el repositorio:
   - **Name**: `regaloparati` (o el nombre que prefieras)
   - **Description**: "Aplicación de amor para parejas"
   - **Visibility**: Private (recomendado) o Public
   - **NO marques** "Initialize with README" (ya tenemos uno)
4. Haz clic en "Create repository"

## 📦 Paso 2: Conectar el Proyecto Local con GitHub

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar git si no está inicializado
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Proyecto RegaloParaTi con mejoras de producción"

# Cambiar a rama main (si es necesario)
git branch -M main

# Agregar el remote de GitHub
git remote add origin https://github.com/TU-USUARIO/regaloparati.git

# Subir el código a GitHub
git push -u origin main
```

**Nota**: Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

## 🔐 Paso 3: Configurar GitHub Secrets

Los secrets son variables de entorno seguras que GitHub Actions usará para el deployment.

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, ve a **Secrets and variables** → **Actions**
4. Haz clic en **New repository secret**
5. Agrega los siguientes secrets:

### Secrets Requeridos

| Secret Name | Descripción | Dónde obtenerlo |
|------------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_ANNIVERSARY_DATE` | Fecha de aniversario | Tu fecha (formato: YYYY-MM-DD) |
| `VERCEL_TOKEN` | Token de Vercel | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Organization ID de Vercel | Vercel → Settings → General |
| `VERCEL_PROJECT_ID` | Project ID de Vercel | Vercel → Settings → General |

### Cómo obtener el VERCEL_TOKEN

1. Ve a [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Haz clic en "Create Token"
3. Dale un nombre (ej: "GitHub Actions")
4. Copia el token generado
5. Pégalo en GitHub Secrets como `VERCEL_TOKEN`

### Cómo obtener VERCEL_ORG_ID y VERCEL_PROJECT_ID

1. Ve a tu proyecto en Vercel
2. Ve a Settings → General
3. Encuentra:
   - **Team ID** → Este es tu `VERCEL_ORG_ID`
   - **Project ID** → Este es tu `VERCEL_PROJECT_ID`

## 🚀 Paso 4: Conectar con Vercel

### Opción A: Conectar desde Vercel (Recomendado)

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en "Add New" → "Project"
3. Selecciona "Import Git Repository"
4. Busca y selecciona tu repositorio de GitHub
5. Configura el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (raíz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_ANNIVERSARY_DATE`
7. Haz clic en "Deploy"

### Opción B: Usar Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Conectar el proyecto
vercel link

# Deploy
vercel
```

## ✅ Paso 5: Verificar que Todo Funciona

### Verificar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **Actions**
3. Deberías ver que los workflows se están ejecutando
4. Verifica que no haya errores

### Verificar Deployment en Vercel

1. Ve a tu proyecto en Vercel
2. Verifica que el deployment se haya completado
3. Abre la URL de producción
4. Verifica que la aplicación funcione correctamente

## 🔄 Paso 6: Workflow de Desarrollo

Ahora que todo está configurado, este es el flujo de trabajo:

### Para hacer cambios:

1. **Crear una rama**:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```

2. **Hacer cambios y commitear**:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   ```

3. **Subir a GitHub**:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```

4. **Crear Pull Request**:
   - Ve a GitHub
   - Haz clic en "Compare & pull request"
   - GitHub Actions ejecutará los tests
   - Vercel creará un preview deployment
   - Revisa los cambios
   - Haz merge a `main`

5. **Deploy automático**:
   - Cuando haces merge a `main`, Vercel despliega automáticamente a producción

## 🐛 Solución de Problemas

### Error: "Secrets not found"

- Verifica que hayas agregado todos los secrets en GitHub
- Asegúrate de que los nombres de los secrets sean exactamente los mismos

### Error: "Vercel deployment failed"

- Verifica que las variables de entorno estén configuradas en Vercel
- Revisa los logs de build en Vercel
- Asegúrate de que el token de Vercel sea válido

### Error: "GitHub Actions failed"

- Revisa los logs en la pestaña Actions de GitHub
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el código compile sin errores

### El deployment no se actualiza automáticamente

- Verifica que el webhook de Vercel esté configurado en GitHub
- Ve a Vercel → Settings → Git y verifica la conexión

## 📊 Monitoreo

### GitHub Actions

- Ve a la pestaña **Actions** en GitHub para ver el estado de los workflows
- Los workflows se ejecutan en cada push y PR

### Vercel

- Ve a tu proyecto en Vercel para ver los deployments
- Cada commit en `main` crea un nuevo deployment
- Los PRs crean preview deployments automáticamente

## 🔒 Seguridad

- ✅ Nunca commitees archivos `.env.local`
- ✅ Usa GitHub Secrets para datos sensibles
- ✅ Verifica que `.gitignore` incluya `.env*`
- ✅ Revisa los permisos del repositorio

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en GitHub Actions
2. Revisa los logs en Vercel
3. Verifica la documentación de GitHub Actions y Vercel
4. Abre un issue en el repositorio

---

¡Listo! Tu proyecto está conectado con GitHub y configurado para deployment automático. 🎉

