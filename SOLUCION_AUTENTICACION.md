# 🔐 Solución de Autenticación GitHub

## Problema
Error 403: Permission denied - Las credenciales guardadas son de otro usuario.

## Soluciones

### Opción 1: Usar Personal Access Token (Recomendado)

1. **Crear un Personal Access Token en GitHub:**
   - Ve a: https://github.com/settings/tokens
   - Click en "Generate new token" → "Generate new token (classic)"
   - Dale un nombre: "RegaloParaTi Local"
   - Selecciona los scopes: `repo` (todos los permisos de repositorio)
   - Click en "Generate token"
   - **COPIA EL TOKEN** (solo se muestra una vez)

2. **Usar el token para hacer push:**
   ```bash
   git push https://TU_TOKEN@github.com/RicardoJSequeda/RegaloParaTi-3-.git main
   ```
   
   O configurar el remote con el token:
   ```bash
   git remote set-url origin https://TU_TOKEN@github.com/RicardoJSequeda/RegaloParaTi-3-.git
   git push origin main
   ```

### Opción 2: Usar SSH (Más seguro a largo plazo)

1. **Generar clave SSH (si no tienes una):**
   ```bash
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   ```

2. **Agregar la clave a GitHub:**
   - Copia el contenido de `~/.ssh/id_ed25519.pub`
   - Ve a: https://github.com/settings/keys
   - Click en "New SSH key"
   - Pega la clave y guarda

3. **Cambiar el remote a SSH:**
   ```bash
   git remote set-url origin git@github.com:RicardoJSequeda/RegaloParaTi-3-.git
   git push origin main
   ```

### Opción 3: Limpiar credenciales de Windows y reautenticar

1. **Limpiar credenciales guardadas:**
   - Abre "Administrador de credenciales de Windows"
   - Busca "github.com"
   - Elimina las credenciales guardadas

2. **Al hacer push, Windows te pedirá credenciales nuevas**

### Opción 4: Usar GitHub Desktop

1. Instala GitHub Desktop: https://desktop.github.com/
2. Abre el proyecto en GitHub Desktop
3. Haz click en "Push origin"

## Recomendación

**Usa la Opción 1 (Personal Access Token)** porque es la más rápida y funciona inmediatamente.

