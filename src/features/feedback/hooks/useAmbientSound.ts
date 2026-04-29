import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store'

type NoiseType = 'brown' | 'white'

const BUFFER_SECONDS = 3

function generateNoiseBuffer(ctx: AudioContext, type: NoiseType): AudioBuffer {
  const length = ctx.sampleRate * BUFFER_SECONDS
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  } else {
    // Brown noise: integración de ruido blanco
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (last + 0.02 * white) / 1.02
      last = data[i]
      data[i] *= 3.5
    }
  }

  return buffer
}

/**
 * Reproduce ruido de fondo (brown/white) en loop continuo.
 */
export function useAmbientSound() {
  const ambientSound = useAppStore((s) => s.settings.ambientSound)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    function cleanup() {
      try { sourceRef.current?.stop() } catch { /* ya detenido */ }
      ctxRef.current?.close().catch(() => {})
      sourceRef.current = null
      ctxRef.current = null
    }

    if (ambientSound === 'off') {
      cleanup()
      return
    }

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const buffer = generateNoiseBuffer(ctx, ambientSound as NoiseType)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.07, ctx.currentTime)

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    sourceRef.current = source

    return cleanup
  }, [ambientSound])
}
