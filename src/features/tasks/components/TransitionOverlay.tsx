import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { fireConfetti } from '@/features/feedback'

const AUTO_DISMISS_MS = 4000

export function TransitionOverlay() {
  const transition = useAppStore((s) => s.transition)
  const clearTransition = useAppStore((s) => s.clearTransition)
  const setTimerMode = useAppStore((s) => s.setTimerMode)
  const startTimer = useAppStore((s) => s.startTimer)
  const [progress, setProgress] = useState(100)
  const firedRef = useRef(false)

  // Confetti al aparecer
  useEffect(() => {
    if (transition && !firedRef.current) {
      firedRef.current = true
      fireConfetti()
    }
    if (!transition) {
      firedRef.current = false
    }
  }, [transition])

  // Auto-dismiss con barra de cuenta regresiva
  useEffect(() => {
    if (!transition) {
      setProgress(100)
      return
    }

    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearTransition()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [transition, clearTransition])

  if (!transition) return null

  function handleWhatsNext() {
    clearTransition()
    // selectedTaskId ya es null — la lista aparece sola
  }

  function handleTakeBreak() {
    setTimerMode('break')
    startTimer()
    clearTransition()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
      onClick={clearTransition}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de cuenta regresiva */}
        <div
          className="absolute top-0 inset-x-0 h-0.5 bg-success transition-none"
          style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
        />

        <div className="p-8 flex flex-col items-center gap-6 text-center">
          {/* Ícono celebración */}
          <div className="text-6xl animate-bounce">
            ✅
          </div>

          {/* Título y tarea */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-success uppercase tracking-widest">
              ¡Completada!
            </p>
            <h2 className="text-xl font-semibold text-foreground leading-tight">
              {transition.taskTitle}
            </h2>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleWhatsNext}
              className="w-full py-3 rounded-xl font-medium text-sm bg-primary text-white hover:opacity-90 active:scale-95 transition-all"
            >
              ¿Qué sigue? →
            </button>
            <button
              onClick={handleTakeBreak}
              className="w-full py-3 rounded-xl font-medium text-sm bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 active:scale-95 transition-all"
            >
              Tomar un respiro 🌿
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            O hacé click afuera para cerrar
          </p>
        </div>
      </div>
    </div>
  )
}
