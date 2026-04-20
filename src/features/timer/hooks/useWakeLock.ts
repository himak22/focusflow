import { useEffect, useRef } from 'react'

// Tipos mínimos de la Wake Lock API (no siempre presentes en lib.dom)
interface WakeLockSentinel {
  release(): Promise<void>
  readonly released: boolean
}

interface WakeLockNavigator {
  wakeLock: {
    request(type: 'screen'): Promise<WakeLockSentinel>
  }
}

function supportsWakeLock(): boolean {
  return 'wakeLock' in navigator
}

function getWakeLock(): WakeLockNavigator['wakeLock'] | null {
  if (!supportsWakeLock()) return null
  return (navigator as Navigator & WakeLockNavigator).wakeLock
}

/**
 * Mantiene la pantalla encendida mientras `active` sea true.
 * Reacquiere el lock automáticamente cuando el documento vuelve a ser visible
 * (el browser libera el lock al ocultar la pestaña).
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  async function acquire() {
    const api = getWakeLock()
    if (!api) return
    try {
      sentinelRef.current = await api.request('screen')
    } catch {
      // El usuario puede denegar el permiso o el dispositivo no lo soporta
    }
  }

  async function release() {
    if (sentinelRef.current && !sentinelRef.current.released) {
      await sentinelRef.current.release()
    }
    sentinelRef.current = null
  }

  // Solicitar / liberar según `active`
  useEffect(() => {
    if (active) {
      acquire()
    } else {
      release()
    }
    return () => {
      release()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Reacquirir cuando el documento vuelve a ser visible
  useEffect(() => {
    if (!supportsWakeLock()) return

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && active) {
        acquire()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}
