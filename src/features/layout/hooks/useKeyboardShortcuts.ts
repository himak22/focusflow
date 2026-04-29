import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store'

/**
 * Atajos de teclado globales para reducir fricción (crítico para TDAH).
 * Reglas:
 * - Space: Start/Pause timer (solo cuando NO hay un input/textarea enfocado)
 * - Esc: Salir de focus mode, o cerrar overlays abiertos
 * - /: Enfocar el input de nueva tarea (solo cuando NO hay un input enfocado)
 */
export function useKeyboardShortcuts() {
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
      // Si hay overlay de transición abierto, Esc lo cierra
      if (transition && e.key === 'Escape') {
        e.preventDefault()
        clearTransition()
        return
      }

      // Si hay una tarea seleccionada, Escape la deselecciona (sale de focus mode)
      if (e.key === 'Escape' && selectedTaskId) {
        e.preventDefault()
        selectTask(null)
        return
      }

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
    startTimer,
    pauseTimer,
    resetTimer,
    selectTask,
    clearTransition,
    isTyping,
  ])
}
