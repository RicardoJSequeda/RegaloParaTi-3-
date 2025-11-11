# 🚀 Guía de Deployment

Esta guía te ayudará a desplegar la aplicación RegaloParaTi en producción.

## 📋 Prerrequisitos

1. Cuenta de GitHub
2. Cuenta de Vercel (gratuita)
3. Cuenta de Supabase (gratuita)
4. Node.js 18+ instalado localmente

## 🔧 Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Anota las siguientes credenciales:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (en Settings → API)

### 2. Crear las tablas en Supabase

Ejecuta los siguientes scripts SQL en el SQL Editor de Supabase:

```sql
-- Ejemplo de tabla para diary_entries
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repite para otras tablas: messages, gifts, recipes, movies, photos, places, plans, surprises, milestones, goals, dreams, curiosities
```

## 🔐 Configuración de GitHub

### 1. Crear repositorio

1. Crea un nuevo repositorio en GitHub
2. Conecta tu proyecto local:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/regaloparati.git
git push -u origin main
```

### 2. Configurar GitHub Secrets

Ve a Settings → Secrets and variables → Actions en tu repositorio y agrega:

- `NEXT_PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key de Supabase
- `NEXT_PUBLIC_ANNIVERSARY_DATE` - Fecha de aniversario (YYYY-MM-DD)
- `VERCEL_TOKEN` - Token de Vercel (obtener en Vercel → Settings → Tokens)
- `VERCEL_ORG_ID` - Organization ID de Vercel
- `VERCEL_PROJECT_ID` - Project ID de Vercel

## 🚀 Deployment en Vercel

### Opción 1: Deployment Automático con GitHub

1. Ve a [https://vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura el proyecto:
   - Framework Preset: Next.js
   - Root Directory: `.` (raíz)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. Agrega las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_ANNIVERSARY_DATE`

5. Deploy! Vercel desplegará automáticamente en cada push a `main`

### Opción 2: Deployment Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

## 🔄 GitHub Actions (CI/CD)

El proyecto incluye GitHub Actions configurados que:

1. **Lint y Type Check**: Verifica el código en cada PR
2. **Build**: Compila la aplicación
3. **Deploy Preview**: Crea preview deployments para PRs
4. **Deploy Production**: Despliega a producción en push a `main`

### Configurar GitHub Actions

1. Asegúrate de tener los secrets configurados en GitHub
2. Los workflows se ejecutarán automáticamente en cada push/PR

## 📝 Variables de Entorno

### Desarrollo Local

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_ANNIVERSARY_DATE=2023-02-03
NODE_ENV=development
```

### Producción (Vercel)

Agrega las mismas variables en el dashboard de Vercel:
- Project Settings → Environment Variables

## ✅ Verificación Post-Deployment

Después del deployment, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ El login funciona
3. ✅ Las API routes responden
4. ✅ Las imágenes se cargan
5. ✅ La base de datos se conecta

## 🐛 Troubleshooting

### Error: "Missing environment variables"

- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que las variables empiecen con `NEXT_PUBLIC_` si se usan en el cliente

### Error: "Database connection failed"

- Verifica las credenciales de Supabase
- Asegúrate de que las tablas estén creadas
- Revisa los logs de Supabase

### Error: "Build failed"

- Revisa los logs de build en Vercel
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el código no tenga errores de TypeScript

## 📊 Monitoreo

Considera agregar:

- **Vercel Analytics**: Para métricas de performance
- **Sentry**: Para error tracking
- **Supabase Logs**: Para monitoreo de la base de datos

## 🔒 Seguridad

- ✅ Nunca commitees archivos `.env.local`
- ✅ Usa variables de entorno para secrets
- ✅ Habilita HTTPS (automático en Vercel)
- ✅ Configura CORS en Supabase si es necesario
- ✅ Revisa los permisos de las tablas en Supabase

## 📞 Soporte

Si tienes problemas con el deployment:

1. Revisa los logs en Vercel
2. Verifica los logs de GitHub Actions
3. Revisa la documentación de Vercel y Supabase
4. Abre un issue en GitHub

---

¡Feliz deployment! 🎉

