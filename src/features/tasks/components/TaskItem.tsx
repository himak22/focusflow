import { useAppStore } from '@/store'
import type { Task } from '@/store'

interface TaskItemProps {
  task: Task
  isSelected: boolean
}

export function TaskItem({ task, isSelected }: TaskItemProps) {
  const selectTask = useAppStore((s) => s.selectTask)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const triggerTransition = useAppStore((s) => s.triggerTransition)

  function handleComplete() {
    setTaskStatus(task.id, 'completed')
    if (isSelected) {
      selectTask(null)
      triggerTransition(task.title)
    }
  }

  function handleSelect() {
    if (isSelected) {
      selectTask(null)
      setTaskStatus(task.id, 'pending')
    } else {
      selectTask(task.id)
    }
  }

  return (
    <div
      className={[
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
        isSelected
          ? 'border-primary/50 bg-primary/5'
          : 'border-transparent hover:border-border hover:bg-muted/40',
      ].join(' ')}
    >
      {/* Checkbox completar */}
      <button
        onClick={handleComplete}
        title="Marcar como completada"
        className="w-5 h-5 rounded-full border-2 border-border hover:border-success hover:bg-success/10 transition-colors flex-shrink-0"
      />

      {/* Quick win badge */}
      {task.isQuickWin && (
        <span title="Quick win" className="text-sm flex-shrink-0">⚡</span>
      )}

      {/* Título — clickable para seleccionar */}
      <button
        onClick={handleSelect}
        className="flex-1 text-left text-sm leading-snug"
      >
        {task.title}
      </button>

      {/* Pomodoros estimados */}
      {task.estimatedPomodoros > 0 && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
        </span>
      )}

      {/* Estado in-progress */}
      {task.status === 'in-progress' && (
        <span className="text-xs font-medium text-primary flex-shrink-0">
          Activa
        </span>
      )}

      {/* Botón eliminar — visible solo en hover */}
      <button
        onClick={() => deleteTask(task.id)}
        title="Eliminar tarea"
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  )
}
