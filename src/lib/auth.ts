import { CORRECT_ANNIVERSARY_DATE } from '@/utils/constants'

/**
 * Valida si la fecha de aniversario proporcionada es correcta
 * @param date - Fecha a validar en formato YYYY-MM-DD
 * @returns true si la fecha es correcta, false en caso contrario
 */
export function validateAnniversaryDate(date: string): boolean {
  return date === CORRECT_ANNIVERSARY_DATE
}

/**
 * Formatea la fecha de aniversario para mostrar
 * @param date - Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada
 */
export function formatAnniversaryDate(date: string): string {
  const [year, month, day] = date.split('-')
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  return `${day} de ${monthNames[parseInt(month) - 1]}, ${year}`
}
