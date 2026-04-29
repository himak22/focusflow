import { useState } from 'react'
import { useAppStore } from '@/store'
import type { Task } from '@/store'
import { useSortedTasks, useCompletedTasks } from '../hooks/useSortedTasks'
import { TaskInput } from './TaskInput'
import { TaskItem } from './TaskItem'
import { SourceToggle } from './SourceToggle'
import { InboxCleanup } from './InboxCleanup'

export function TaskList() {
  const [tag, setTag] = useState<string>('today')
  const [cleanupSnapshot, setCleanupSnapshot] = useState<Task[] | null>(null)
  const selectedTaskId = useAppStore((s) => s.selectedTaskId)
  const pending = useSortedTasks(tag)
  const completed = useCompletedTasks(tag)

  function openCleanup() {
    // Snapshot de las tareas inbox al momento de abrir
    setCleanupSnapshot([...pending])
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SourceToggle value={tag} onChange={setTag} />

          <div className="flex items-center gap-3">
            {/* Botón limpiar inbox */}
            {tag === 'inbox' && pending.length > 0 && (
              <button
                onClick={openCleanup}
                className="text-xs font-medium text-primary hover:opacity-75 transition-opacity"
              >
                Limpiar inbox →
              </button>
            )}
            {pending.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <TaskInput tag={tag} />

        <div className="flex flex-col gap-1 mt-1">
          {pending.length === 0 && completed.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-4xl">
                {tag === 'inbox' ? '🎉' : '✨'}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {tag === 'inbox'
                    ? '¡Inbox vacío!'
                    : '¿Qué querés lograr hoy?'}
                </p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  {tag === 'inbox'
                    ? 'Sin nada pendiente dando vueltas en la cabeza.'
                    : 'Escribí tu primera tarea arriba. Si te cuesta empezar, probá con algo de 5 min.'}
                </p>
              </div>
            </div>
          )}

          {pending.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={task.id === selectedTaskId}
            />
          ))}

          {completed.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-3 mb-1 px-1">
                Completadas ({completed.length})
              </p>
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2 opacity-50"
                >
                  <span className="w-5 h-5 rounded-md bg-success/30 flex items-center justify-center text-xs">✓</span>
                  <span className="text-sm line-through text-muted-foreground">{task.title}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {cleanupSnapshot && (
        <InboxCleanup
          tasks={cleanupSnapshot}
          onClose={() => setCleanupSnapshot(null)}
        />
      )}
    </>
  )
}
