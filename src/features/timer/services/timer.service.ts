import type { WorkerToMain, MainToWorker } from '../workers/timer.types'

type TimerCallbacks = {
  onTick: (remainingSeconds: number) => void
  onCompleted: () => void
}

/**
 * TimerService — singleton puro, fuera de React.
 * Único responsable de la comunicación con el Web Worker.
 * No importa el store. Recibe callbacks en init().
 */
class TimerService {
  private worker: Worker | null = null
  private callbacks: TimerCallbacks | null = null

  init(callbacks: TimerCallbacks) {
    if (this.worker) return // ya inicializado

    this.callbacks = callbacks
    this.worker = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url),
      { type: 'module' }
    )

    this.worker.onmessage = (e: MessageEvent<WorkerToMain>) => {
      if (e.data.type === 'TICK') {
        this.callbacks?.onTick(e.data.remainingSeconds)
      } else if (e.data.type === 'COMPLETED') {
        this.callbacks?.onCompleted()
      }
    }
  }

  terminate() {
    this.worker?.terminate()
    this.worker = null
    this.callbacks = null
  }

  start(remainingSeconds: number) {
    this.post({ type: 'START', remainingSeconds })
  }

  pause() {
    this.post({ type: 'PAUSE' })
  }

  reset(remainingSeconds: number) {
    this.post({ type: 'RESET', remainingSeconds })
  }

  private post(msg: MainToWorker) {
    this.worker?.postMessage(msg)
  }
}

export const timerService = new TimerService()
