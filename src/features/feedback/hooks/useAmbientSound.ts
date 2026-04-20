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
      data[i] *= 3.5 // amplificar
    }
  }

  return buffer
}

/**
 * Reproduce ruido de fondo (brown/white) en loop continuo.
 * Volumen bajo para no distraer — solo ambiente.
 */
export function useAmbientSound() {
  const ambientSound = useAppStore((s) => s.settings.ambientSound)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (ambientSound === 'off') {
      sourceRef.current?.stop()
      sourceRef.current = null
      ctxRef.current?.close()
      ctxRef.current = null
      return
    }

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const buffer = generateNoiseBuffer(ctx, ambientSound)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.07, ctx.currentTime) // muy bajo — solo ambiente
    gainRef.current = gain

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    sourceRef.current = source

    return () => {
      try { source.stop() } catch { /* ya detenido */ }
      ctx.close().catch(() => {})
      sourceRef.current = null
      ctxRef.current = null
    }
  }, [ambientSound])
}
