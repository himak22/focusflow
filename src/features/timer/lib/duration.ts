/**
 * Parsea una string de duración en minutos.
 * Soporta: "90", "2h", "1.5h", "2 h", "  2H  "
 * Devuelve null si no es válido.
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim().toLowerCase().replace(/\s/g, '')
  if (!trimmed) return null

  // Patrón: número opcional + h + número opcional
  const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)h(\d+(?:\.\d+)?)?$/)
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1])
    const minutes = hourMatch[2] ? parseFloat(hourMatch[2]) : 0
    if (Number.isNaN(hours)) return null
    const total = Math.round(hours * 60 + minutes)
    return total > 0 ? total : null
  }

  // Patrón: solo número (minutos)
  const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/)
  if (numMatch) {
    const total = Math.round(parseFloat(numMatch[1]))
    return total > 0 ? total : null
  }

  return null
}

function roundToFive(n: number): number {
  return Math.max(5, Math.round(n / 5) * 5)
}

export interface SessionOption {
  sessions: number      // cantidad de sesiones
  workMinutes: number   // minutos por sesión
  label: string         // texto a mostrar
}

/**
 * Genera opciones de sesiones para una duración total.
 * Máximo 4 opciones, redondeadas a múltiplo de 5.
 * No incluye opciones donde workMinutes < 15.
 */
export function generateSessionOptions(totalMinutes: number): SessionOption[] {
  const options: SessionOption[] = []

  // Opción 1: todo de una
  options.push({
    sessions: 1,
    workMinutes: totalMinutes,
    label: `${totalMinutes} min`,
  })

  // Opciones 2-4: dividir en 2, 3, 4 sesiones
  const splits = [2, 3, 4]
  for (const sessions of splits) {
    const workMinutes = roundToFive(totalMinutes / sessions)
    if (workMinutes >= 15) {
      options.push({
        sessions,
        workMinutes,
        label: `${sessions}×${workMinutes} min`,
      })
    }
  }

  return options
}
