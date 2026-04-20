/// <reference lib="webworker" />

type MainToWorker =
  | { type: 'START'; remainingSeconds: number }
  | { type: 'PAUSE' }
  | { type: 'RESET'; remainingSeconds: number }

type WorkerToMain =
  | { type: 'TICK'; remainingSeconds: number }
  | { type: 'COMPLETED' }

let remaining = 0
let intervalId: ReturnType<typeof setInterval> | null = null

function stop() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

self.onmessage = (e: MessageEvent<MainToWorker>) => {
  const msg = e.data

  switch (msg.type) {
    case 'START':
      stop()
      remaining = msg.remainingSeconds
      intervalId = setInterval(() => {
        remaining -= 1
        if (remaining <= 0) {
          stop()
          self.postMessage({ type: 'COMPLETED' } satisfies WorkerToMain)
        } else {
          self.postMessage({ type: 'TICK', remainingSeconds: remaining } satisfies WorkerToMain)
        }
      }, 1000)
      break

    case 'PAUSE':
      stop()
      break

    case 'RESET':
      stop()
      remaining = msg.remainingSeconds
      break
  }
}
