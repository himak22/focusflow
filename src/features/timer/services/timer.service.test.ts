import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timerService } from './timer.service'
import type { WorkerToMain } from '../workers/timer.types'

/**
 * Mock de Worker para jsdom.
 * Expone postMessage para simular mensajes del main al worker,
 * y permite al test disparar onmessage para simular mensajes del worker al main.
 */
class MockWorker {
  onmessage: ((e: MessageEvent<WorkerToMain>) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
}

describe('TimerService', () => {
  let mockWorker: MockWorker
  let originalWorker: typeof globalThis.Worker | undefined

  beforeEach(() => {
    mockWorker = new MockWorker()
    originalWorker = globalThis.Worker
    globalThis.Worker = vi.fn(function () { return mockWorker as unknown as Worker }) as unknown as typeof globalThis.Worker
    // reset singleton state
    timerService.terminate()
  })

  afterEach(() => {
    if (originalWorker) {
      globalThis.Worker = originalWorker
    } else {
      // @ts-expect-error cleaning up global
      delete globalThis.Worker
    }
    timerService.terminate()
  })

  it('init creates a Worker and attaches onmessage', () => {
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    expect(globalThis.Worker).toHaveBeenCalledTimes(1)
    expect(mockWorker.onmessage).toBeInstanceOf(Function)
  })

  it('init is idempotent — second call does nothing', () => {
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    expect(globalThis.Worker).toHaveBeenCalledTimes(1)
  })

  it('start sends START message with remainingSeconds', () => {
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    timerService.start(150)
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'START', remainingSeconds: 150 })
  })

  it('pause sends PAUSE message', () => {
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    timerService.pause()
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'PAUSE' })
  })

  it('reset sends RESET message with remainingSeconds', () => {
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    timerService.reset(300)
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'RESET', remainingSeconds: 300 })
  })

  it('onTick callback is fired on TICK message from worker', () => {
    const onTick = vi.fn()
    const onCompleted = vi.fn()
    timerService.init({ onTick, onCompleted })

    // Simulate worker sending TICK
    const event = new MessageEvent<WorkerToMain>('message', {
      data: { type: 'TICK', remainingSeconds: 42 } as WorkerToMain,
    })
    mockWorker.onmessage!(event)

    expect(onTick).toHaveBeenCalledWith(42)
    expect(onCompleted).not.toHaveBeenCalled()
  })

  it('onCompleted callback is fired on COMPLETED message from worker', () => {
    const onTick = vi.fn()
    const onCompleted = vi.fn()
    timerService.init({ onTick, onCompleted })

    const event = new MessageEvent<WorkerToMain>('message', {
      data: { type: 'COMPLETED' } as WorkerToMain,
    })
    mockWorker.onmessage!(event)

    expect(onCompleted).toHaveBeenCalled()
    expect(onTick).not.toHaveBeenCalled()
  })

  it('terminate calls worker.terminate and resets state', () => {
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    timerService.terminate()
    expect(mockWorker.terminate).toHaveBeenCalled()
    // After terminate, init should create a new worker
    timerService.init({ onTick: vi.fn(), onCompleted: vi.fn() })
    expect(globalThis.Worker).toHaveBeenCalledTimes(2)
  })
})
