import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { TaskList } from './TaskList'

/**
 * Cuando hay una tarea activa (modo enfoque):
 * - Oculta el resto de tareas pendientes
 * - Ofrece toggle para verlas sin salir del modo enfoque
 * - "Salir del enfoque" deselecciona la tarea y muestra lista completa
 *
 * Sin tarea activa → renderiza TaskList normal.
 */
export function FocusModeGate() {
  const [showList, setShowList] = useState(false)
  const selectedTaskId = useAppStore((s) => s.selectedTaskId)
  const selectTask = useAppStore((s) => s.selectTask)

  // Ocultar lista cuando cambia la tarea activa
  useEffect(() => {
    setShowList(false)
  }, [selectedTaskId])

  if (!selectedTaskId) {
    return <TaskList />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Banner modo enfoque */}
      <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🎯</span>
          <span className="text-xs font-medium text-primary">Modo enfoque activo</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            — otras tareas ocultas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowList((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showList ? 'Ocultar lista' : 'Ver tareas'}
          </button>

          <span className="text-border">|</span>

          <button
            onClick={() => selectTask(null)}
            className="text-xs font-medium text-primary hover:opacity-75 transition-opacity"
          >
            Salir del enfoque
          </button>
        </div>
      </div>

      {/* Lista colapsable — reducida en opacidad para no distraer */}
      {showList && (
        <div className="opacity-60 hover:opacity-100 transition-opacity duration-200">
          <TaskList />
        </div>
      )}
    </div>
  )
}
