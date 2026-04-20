import confetti from 'canvas-confetti'

const FOCUSFLOW_COLORS = ['#6366F1', '#10B981', '#F97316', '#FCD34D', '#3B82F6']

/**
 * Dispara confeti suave — colores de la paleta FocusFlow.
 * Dos ráfagas desde los costados para efecto más natural.
 */
export function fireConfetti() {
  const base = {
    particleCount: 60,
    spread: 55,
    colors: FOCUSFLOW_COLORS,
    ticks: 200,
    gravity: 1.2,
    scalar: 0.9,
    drift: 0,
  }

  confetti({ ...base, origin: { x: 0.2, y: 0.6 }, angle: 60 })
  confetti({ ...base, origin: { x: 0.8, y: 0.6 }, angle: 120 })
}
