import confetti from 'canvas-confetti'

const FOCUSFLOW_COLORS = ['#6366F1', '#10B981', '#F97316', '#FCD34D', '#3B82F6']

/**
 * Dispara confeti suave — colores de la paleta FocusFlow.
 * Respeta `prefers-reduced-motion: reduce` (sin confeti en ese caso).
 */
export function fireConfetti() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

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
