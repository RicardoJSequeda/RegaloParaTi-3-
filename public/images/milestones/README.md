# Carpeta de Imágenes de Hitos

Esta carpeta está destinada para almacenar las imágenes de los hitos de la relación.

## Formato Recomendado

- **Ratio**: 9:16 (formato vertical de celular)
- **Tamaño**: 300x533 píxeles
- **Formato**: JPG, PNG, WebP
- **Peso máximo**: 500KB por imagen

## Estructura de Nombres

Se recomienda usar nombres descriptivos:
- `primera-cita.jpg`
- `viaje-playa.jpg`
- `concierto-romantico.jpg`
- `aniversario-6-meses.jpg`

## Cómo Usar

1. Sube tus imágenes a esta carpeta
2. En el código, referencia las imágenes como: `/images/milestones/nombre-imagen.jpg`
3. Las imágenes se mostrarán automáticamente en formato vertical de celular

## Ejemplo de Uso en el Código

```javascript
{
  id: 1,
  title: "Nuestra Primera Cita",
  date: "2023-02-14",
  description: "Una cena romántica que marcó el comienzo",
  image: "/images/milestones/primera-cita.jpg",
  type: "aniversario"
}
```
