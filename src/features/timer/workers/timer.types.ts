export type MainToWorker =
  | { type: 'START'; remainingSeconds: number }
  | { type: 'PAUSE' }
  | { type: 'RESET'; remainingSeconds: number }

export type WorkerToMain =
  | { type: 'TICK'; remainingSeconds: number }
  | { type: 'COMPLETED' }
