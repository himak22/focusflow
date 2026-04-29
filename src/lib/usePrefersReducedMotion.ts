import { useSyncExternalStore } from 'react'

/**
 * Hook que devuelve true si el usuario ha solicitado reduced motion
 * (accesibilidad → movimiento reducido).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      mql.addEventListener('change', callback)
      return () => mql.removeEventListener('change', callback)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false // SSR default
  )
}
