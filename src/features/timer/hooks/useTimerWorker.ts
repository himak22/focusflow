import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { timerService } from '@/features/timer/services'
import { isTimerRunning } from '@/store/types'

/**
 * Glue entre React lifecycle y TimerService.
 * Inicializa el worker y sincroniza el estado del store con el worker.
 * Debe llamarse una sola vez en el nivel raíz de la app.
 */
export function useTimerWorker() {
  // Inicializar TimerService con callbacks al store
  useEffect(() => {
    const store = useAppStore.getState()
    timerService.init({
      onTick: (remainingSeconds) => store._syncTimerSeconds(remainingSeconds),
      onCompleted: () => store._completePomodoro(),
    })
    return () => timerService.terminate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = useAppStore((s) => s.timer.status)

  // Enviar START/PAUSE al worker según el estado del timer
  useEffect(() => {
    const store = useAppStore.getState()
    if (isTimerRunning(status)) {
      timerService.start(store.timer.remainingSeconds)
    } else {
      timerService.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Sincronizar remainingSeconds cuando el timer NO está corriendo
  // (ej: reset, cambio de duración, cambio de modo)
  useEffect(() => {
    if (isTimerRunning(status)) return
    const store = useAppStore.getState()
    timerService.reset(store.timer.remainingSeconds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}
