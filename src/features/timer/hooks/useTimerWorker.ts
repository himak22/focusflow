import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store'

type WorkerToMain =
  | { type: 'TICK'; remainingSeconds: number }
  | { type: 'COMPLETED' }

/**
 * Gestiona el ciclo de vida del Web Worker del timer.
 * Observa el store y sincroniza el estado con el worker.
 * Debe llamarse una sola vez en el nivel raíz de la app.
 */
export function useTimerWorker() {
  const workerRef = useRef<Worker | null>(null)
  const prevIsRunningRef = useRef(false)

  const isRunning = useAppStore((s) => s.timer.isRunning)
  const remainingSeconds = useAppStore((s) => s.timer.remainingSeconds)
  const syncTimerSeconds = useAppStore((s) => s.syncTimerSeconds)
  const completePomodoro = useAppStore((s) => s.completePomodoro)

  // Crear worker al montar, terminar al desmontar
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e: MessageEvent<WorkerToMain>) => {
      if (e.data.type === 'TICK') {
        syncTimerSeconds(e.data.remainingSeconds)
      } else if (e.data.type === 'COMPLETED') {
        completePomodoro()
      }
    }

    workerRef.current = worker

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  // Las acciones del store son referencias estables — no necesitan ir en deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincronizar isRunning con el worker
  useEffect(() => {
    const worker = workerRef.current
    if (!worker) return

    if (isRunning && !prevIsRunningRef.current) {
      worker.postMessage({ type: 'START', remainingSeconds })
    } else if (!isRunning && prevIsRunningRef.current) {
      worker.postMessage({ type: 'PAUSE' })
    }

    prevIsRunningRef.current = isRunning
  // remainingSeconds intencionalmente omitido: solo queremos reaccionar al cambio de isRunning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  // Sincronizar segundos cuando el timer NO está corriendo (reset / cambio de duración)
  useEffect(() => {
    const worker = workerRef.current
    if (!worker || isRunning) return
    worker.postMessage({ type: 'RESET', remainingSeconds })
  // isRunning intencionalmente omitido: solo queremos reaccionar al cambio de remainingSeconds
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds])
}
