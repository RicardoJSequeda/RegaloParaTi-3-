/**
 * Script para generar iconos PWA
 * 
 * Este script genera los iconos necesarios para la PWA.
 * Necesitas tener una imagen base de 512x512px en public/icon-base.png
 * 
 * Para usar este script:
 * 1. Instala sharp: npm install --save-dev sharp
 * 2. Coloca tu icono base en public/icon-base.png (512x512px)
 * 3. Ejecuta: node scripts/generate-icons.js
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputFile = path.join(__dirname, '../public/icon-base.png')
const outputDir = path.join(__dirname, '../public/icons')

// Crear directorio de iconos si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Verificar si existe el archivo base
if (!fs.existsSync(inputFile)) {
  console.error('❌ Error: No se encontró el archivo icon-base.png en public/')
  console.log('📝 Por favor, crea un icono de 512x512px y guárdalo como public/icon-base.png')
  process.exit(1)
}

// Generar iconos
async function generateIcons() {
  console.log('🎨 Generando iconos PWA...')
  
  try {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`)
      
      await sharp(inputFile)
        .resize(size, size)
        .png()
        .toFile(outputFile)
      
      console.log(`✅ Generado: icon-${size}x${size}.png`)
    }
    
    console.log('✨ ¡Iconos generados exitosamente!')
  } catch (error) {
    console.error('❌ Error generando iconos:', error)
    process.exit(1)
  }
}

generateIcons()

