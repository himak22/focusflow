import { useState } from 'react'
import { useAppStore } from '@/store'
import type { Task } from '@/store'

interface InboxCleanupProps {
  tasks: Task[]   // snapshot al momento de abrir
  onClose: () => void
}

export function InboxCleanup({ tasks, onClose }: InboxCleanupProps) {
  const [index, setIndex] = useState(0)
  const updateTask = useAppStore((s) => s.updateTask)
  const deleteTask = useAppStore((s) => s.deleteTask)

  const current = tasks[index]
  const total = tasks.length
  const isDone = index >= total

  function next() {
    setIndex((i) => i + 1)
  }

  function handleToday() {
    updateTask(current.id, { source: 'today' })
    next()
  }

  function handleTomorrow() {
    // Queda en inbox — se procesa en otro momento
    next()
  }

  function handleDelete() {
    deleteTask(current.id)
    next()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de progreso */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${total > 0 ? (index / total) * 100 : 100}%` }}
          />
        </div>

        {isDone ? (
          /* Pantalla de completado */
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">🎉</span>
            <div>
              <p className="text-xs font-medium text-success uppercase tracking-widest mb-1">
                ¡Inbox limpio!
              </p>
              <p className="text-sm text-muted-foreground">
                Sin ansiedad pendiente
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-medium text-sm bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Tarea actual */
          <div key={current.id} className="p-6 flex flex-col gap-5">
            {/* Counter */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {index + 1} de {total}
              </span>
              <button
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Tarea */}
            <div className="flex flex-col gap-1 min-h-[60px] justify-center">
              {current.isQuickWin && (
                <span className="text-xs text-amber-500">⚡ Quick win</span>
              )}
              <p className="text-lg font-semibold text-foreground leading-snug">
                {current.title}
              </p>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleToday}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all"
              >
                <span className="text-lg">☀️</span>
                <span className="text-xs font-medium">Hoy</span>
              </button>
              <button
                onClick={handleTomorrow}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-muted hover:bg-muted/80 active:scale-95 transition-all"
              >
                <span className="text-lg">📅</span>
                <span className="text-xs font-medium text-muted-foreground">Mañana</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-95 transition-all"
              >
                <span className="text-lg">🗑️</span>
                <span className="text-xs font-medium">Borrar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
