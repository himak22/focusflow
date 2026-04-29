import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store'
import { playPop, playDing, unlockAudioContext } from '../lib/soundFX'

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
      unlockAudioContext()
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
