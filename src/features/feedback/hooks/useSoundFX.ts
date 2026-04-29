import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store'

// AudioContext lazy — necesita interacción de usuario antes de poder reproducir
let sharedCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedCtx) {
    sharedCtx = new AudioContext()
  }
  return sharedCtx
}

async function ensureRunning(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

/** Pop suave — tarea completada */
async function playPop() {
  const ctx = getAudioContext()
  if (!ctx) return
  await ensureRunning(ctx)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08)

  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.08)
}

/** Ding — pomodoro completado */
async function playDing() {
  const ctx = getAudioContext()
  if (!ctx) return
  await ensureRunning(ctx)

  // Dos tonos para efecto de campana
  const freqs = [880, 1108] as const
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05)

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.05 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 1.2)

    osc.start(ctx.currentTime + i * 0.05)
    osc.stop(ctx.currentTime + i * 0.05 + 1.2)
  })
}

/**
 * Escucha cambios del store y reproduce sonidos en respuesta.
 * Debe llamarse una sola vez en el nivel raíz de la app.
 */
export function useSoundFX() {
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled)
  const transition = useAppStore((s) => s.transition)
  const currentPomodoro = useAppStore((s) => s.timer.currentPomodoro)

  const prevTransitionRef = useRef(transition)
  const prevPomodoroRef = useRef(currentPomodoro)

  // Desbloquear AudioContext en el primer gesto del usuario.
  // Chrome mantiene el contexto en 'suspended' hasta que hay interacción.
  useEffect(() => {
    function unlock() {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume()
      }
      document.removeEventListener('click', unlock)
      document.removeEventListener('keydown', unlock)
    }
    document.addEventListener('click', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [])

  // Pop cuando aparece la pantalla de transición (tarea completada)
  useEffect(() => {
    if (soundEnabled && transition && !prevTransitionRef.current) {
      playPop()
    }
    prevTransitionRef.current = transition
  }, [transition, soundEnabled])

  // Ding + toast cuando se completa un pomodoro
  useEffect(() => {
    if (currentPomodoro > prevPomodoroRef.current) {
      if (soundEnabled) playDing()
      toast.success('¡Pomodoro completado! 🍅', {
        description: 'Tomá un descanso bien merecido.',
        duration: 4000,
      })
    }
    prevPomodoroRef.current = currentPomodoro
  }, [currentPomodoro, soundEnabled])
}
