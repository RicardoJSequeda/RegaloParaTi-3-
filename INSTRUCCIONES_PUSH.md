# 🔐 Instrucciones para Hacer Push a GitHub

## Problema de Autenticación

GitHub requiere autenticación para hacer push. Tienes dos opciones:

## Opción 1: Usar Token de Acceso Personal (Recomendado)

### Paso 1: Crear Token de Acceso Personal

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en "Generate new token (classic)"
3. Dale un nombre (ej: "RegaloParaTi")
4. Selecciona los permisos:
   - ✅ `repo` (acceso completo a repositorios)
5. Haz clic en "Generate token"
6. **Copia el token** (solo se muestra una vez)

### Paso 2: Configurar Git para usar el Token

```bash
# Opción A: Configurar credential helper (Windows)
git config --global credential.helper wincred

# Opción B: Usar el token en la URL (temporal)
git remote set-url origin https://TU_TOKEN@github.com/RicardoJSequeda/RegaloParaTi-3-.git
```

### Paso 3: Hacer Push

```bash
git push origin main
```

Cuando te pida credenciales:
- **Username**: RicardoJSequeda
- **Password**: Pega tu token (no tu contraseña)

## Opción 2: Usar SSH (Más Seguro a Largo Plazo)

### Paso 1: Generar Clave SSH

```bash
# Generar clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu_email@example.com"

# Presiona Enter para aceptar la ubicación predeterminada
# Opcional: ingresa una contraseña para mayor seguridad
```

### Paso 2: Agregar Clave SSH a GitHub

```bash
# Copiar la clave pública (Windows)
type %USERPROFILE%\.ssh\id_ed25519.pub

# O si usas Git Bash
cat ~/.ssh/id_ed25519.pub
```

1. Copia el contenido de la clave pública
2. Ve a GitHub → Settings → SSH and GPG keys
3. Haz clic en "New SSH key"
4. Pega la clave y guarda

### Paso 3: Cambiar Remote a SSH

```bash
git remote set-url origin git@github.com:RicardoJSequeda/RegaloParaTi-3-.git
```

### Paso 4: Hacer Push

```bash
git push origin main
```

## Opción 3: Usar GitHub CLI (Más Fácil)

### Instalar GitHub CLI

```bash
# Windows (con winget)
winget install --id GitHub.cli

# O descargar desde https://cli.github.com
```

### Autenticarse

```bash
gh auth login
```

### Hacer Push

```bash
git push origin main
```

## Verificar el Estado

```bash
# Ver commits locales que no se han subido
git log origin/main..main

# Ver el estado actual
git status
```

## Solución Rápida (Si Solo Quieres Subir los Cambios)

Si tienes GitHub Desktop instalado:

1. Abre GitHub Desktop
2. Deberías ver los cambios pendientes
3. Escribe un mensaje de commit
4. Haz clic en "Commit to main"
5. Haz clic en "Push origin"

## Verificar que el Push Funcionó

1. Ve a https://github.com/RicardoJSequeda/RegaloParaTi-3-
2. Deberías ver el último commit con las mejoras
3. Revisa que los archivos nuevos estén presentes

## Troubleshooting

### Error: "Permission denied"

- Verifica que el token tenga permisos de `repo`
- Verifica que estés usando el usuario correcto
- Intenta regenerar el token

### Error: "Authentication failed"

- Verifica que el token no haya expirado
- Asegúrate de usar el token, no tu contraseña
- Prueba con un token nuevo

### Error: "Could not resolve hostname"

- Verifica tu conexión a internet
- Verifica que GitHub esté accesible

---

**Recomendación**: Usa la Opción 1 (Token de Acceso Personal) para empezar rápidamente, o la Opción 2 (SSH) para una solución más permanente.

