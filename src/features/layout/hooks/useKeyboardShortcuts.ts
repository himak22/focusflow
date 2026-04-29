import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store'

interface UseKeyboardShortcutsOptions {
  showHelp: boolean
  setShowHelp: (v: boolean) => void
}

/**
 * Atajos de teclado globales para reducir fricción (crítico para TDAH).
 * Reglas:
 * - Space: Start/Pause timer (solo cuando NO hay un input/textarea enfocado)
 * - Esc: Salir de focus mode, o cerrar overlays abiertos, o cerrar help
 * - /: Enfocar el input de nueva tarea (solo cuando NO hay un input enfocado)
 * - ?: Mostrar/ocultar ayuda de atajos (solo cuando NO hay un input enfocado)
 */
export function useKeyboardShortcuts({ showHelp, setShowHelp }: UseKeyboardShortcutsOptions) {
  const timerStatus = useAppStore((s) => s.timer.status)
  const startTimer = useAppStore((s) => s.startTimer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const resetTimer = useAppStore((s) => s.resetTimer)
  const selectTask = useAppStore((s) => s.selectTask)
  const selectedTaskId = useAppStore((s) => s.selectedTaskId)
  const clearTransition = useAppStore((s) => s.clearTransition)
  const transition = useAppStore((s) => s.transition)

  const isTyping = useCallback(() => {
    const el = document.activeElement
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    const editable = (el as HTMLElement).isContentEditable
    return tag === 'input' || tag === 'textarea' || editable
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Escape: cerrar help primero, luego transition, luego focus mode
      if (e.key === 'Escape') {
        e.preventDefault()
        if (showHelp) {
          setShowHelp(false)
          return
        }
        if (transition) {
          clearTransition()
          return
        }
        if (selectedTaskId) {
          selectTask(null)
          return
        }
        return
      }

      // ?: Toggle ayuda de atajos (solo si NO estamos escribiendo)
      if (e.key === '?' && !isTyping()) {
        e.preventDefault()
        setShowHelp(!showHelp)
        return
      }

      // Si el help está abierto, no procesar otros atajos (evita accidentes)
      if (showHelp) return

      // Space: Start/Pause timer (solo si NO estamos escribiendo)
      if (e.key === ' ' && !isTyping()) {
        e.preventDefault()
        const running = timerStatus === 'work_running' || timerStatus === 'break_running'
        if (running) {
          pauseTimer()
        } else {
          startTimer()
        }
        return
      }

      // /: Enfocar input de nueva tarea (solo si NO estamos escribiendo ya)
      if (e.key === '/' && !isTyping()) {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('[data-task-input]')
        input?.focus()
        return
      }

      // R: Reset timer (solo si NO estamos escribiendo)
      if ((e.key === 'r' || e.key === 'R') && !isTyping()) {
        e.preventDefault()
        resetTimer()
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [
    timerStatus,
    selectedTaskId,
    transition,
    showHelp,
    startTimer,
    pauseTimer,
    resetTimer,
    selectTask,
    clearTransition,
    setShowHelp,
    isTyping,
  ])
}
