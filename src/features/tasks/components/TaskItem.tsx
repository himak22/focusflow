import { useState, type KeyboardEvent, useRef, useEffect } from 'react'
import { useAppStore, isTimerRunning } from '@/store'
import type { Task } from '@/store'
import { SessionPicker } from '@/features/timer/components/SessionPicker'

interface TaskItemProps {
  task: Task
  isSelected: boolean
}

export function TaskItem({ task, isSelected }: TaskItemProps) {
  const selectTask = useAppStore((s) => s.selectTask)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const updateTask = useAppStore((s) => s.updateTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const triggerTransition = useAppStore((s) => s.triggerTransition)
  const addSubtask = useAppStore((s) => s.addSubtask)
  const toggleSubtask = useAppStore((s) => s.toggleSubtask)
  const deleteSubtask = useAppStore((s) => s.deleteSubtask)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPomos, setEditPomos] = useState(task.estimatedPomodoros)
  const [expanded, setExpanded] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length
  const totalSubtasks = task.subtasks.length
  const hasSubtasks = totalSubtasks > 0

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  // Auto-expand when selected and has subtasks
  useEffect(() => {
    if (isSelected && hasSubtasks) {
      setExpanded(true)
    }
  }, [isSelected, hasSubtasks])

  function handleComplete() {
    setTaskStatus(task.id, 'completed')
    if (isSelected) {
      selectTask(null)
      triggerTransition(task.title)
    }
  }

  const timerStatus = useAppStore((s) => s.timer.status)

  function handleSelect() {
    if (isSelected) {
      selectTask(null)
      setTaskStatus(task.id, 'pending')
      setShowPicker(false)
      return
    }

    // Si la tarea tiene duration y el timer está detenido, mostrar picker
    if (task.duration && !isTimerRunning(timerStatus)) {
      setShowPicker(true)
      return
    }

    // Comportamiento normal
    selectTask(task.id)
  }

  function startEdit() {
    setEditTitle(task.title)
    setEditPomos(task.estimatedPomodoros)
    setIsEditing(true)
  }

  function saveEdit() {
    const trimmed = editTitle.trim()
    if (!trimmed) {
      setIsEditing(false)
      return
    }
    updateTask(task.id, {
      title: trimmed,
      estimatedPomodoros: Math.max(1, Math.round(editPomos)),
    })
    setIsEditing(false)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  function handleSubtaskKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const trimmed = subtaskInput.trim()
    if (!trimmed) return
    addSubtask(task.id, trimmed)
    setSubtaskInput('')
  }

  return (
    <div
      className={[
        'flex flex-col rounded-lg border transition-all',
        isSelected
          ? 'border-primary/50 bg-primary/5'
          : 'border-transparent hover:border-border hover:bg-muted/40',
      ].join(' ')}
    >
      {/* ─── Row principal ─────────────────────────────────────────────── */}
      <div className="group flex items-center gap-3 px-3 py-2.5">
        {/* Checkbox completar tarea — cuadrado redondeado, más reconocible */}
        <button
          onClick={handleComplete}
          title="Marcar como completada"
          className="w-5 h-5 rounded-md border-2 border-border hover:border-success hover:bg-success/10 transition-all flex-shrink-0 flex items-center justify-center active:scale-90"
        />

        {/* Quick win badge */}
        {task.isQuickWin && (
          <span title="Quick win" className="text-sm flex-shrink-0">⚡</span>
        )}

        {/* Título — editable inline */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={saveEdit}
              className="flex-1 min-w-0 bg-transparent border-b border-primary text-sm outline-none"
            />
            <input
              type="number"
              min={1}
              max={99}
              value={editPomos}
              onChange={(e) => setEditPomos(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              onBlur={saveEdit}
              className="w-12 bg-transparent border-b border-primary text-sm text-center outline-none"
              title="Pomodoros estimados"
            />
            <span className="text-xs text-muted-foreground">🍅</span>
          </div>
        ) : (
          <>
            <button
              onClick={handleSelect}
              onDoubleClick={startEdit}
              className="flex-1 text-left text-sm leading-snug truncate"
              title="Doble click para editar"
            >
              {task.title}
            </button>

            {/* Pomodoros estimados + duración personalizada */}
            {task.estimatedPomodoros > 0 && (
              <button
                onDoubleClick={startEdit}
                className="text-xs text-muted-foreground flex-shrink-0"
                title="Doble click para editar"
              >
                {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
              </button>
            )}
            {task.duration && (
              <span className="text-[10px] text-primary/70 flex-shrink-0 bg-primary/5 px-1.5 py-0.5 rounded">
                ⏱ {task.duration} min
              </span>
            )}
          </>
        )}

        {/* Indicador de micro-pasos */}
        {!isEditing && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={[
              'text-xs flex-shrink-0 transition-colors',
              hasSubtasks
                ? 'text-muted-foreground hover:text-primary'
                : 'text-muted-foreground/0 group-hover:text-muted-foreground hover:text-primary',
            ].join(' ')}
            title={hasSubtasks ? 'Ver micro-pasos' : 'Agregar micro-pasos'}
          >
            {hasSubtasks
              ? `${completedSubtasks}/${totalSubtasks} micro-pasos`
              : '+ micro-pasos'}
          </button>
        )}

        {/* Estado in-progress */}
        {task.status === 'in-progress' && !isEditing && (
          <span className="text-xs font-medium text-primary flex-shrink-0">
            Activa
          </span>
        )}

        {/* Acciones — hover */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={startEdit}
              title="Editar tarea"
              className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 text-xs px-1"
            >
              ✎
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              title="Eliminar tarea"
              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ─── Session Picker ────────────────────────────────────────────── */}
      {showPicker && task.duration && (
        <div className="px-3 pb-2 pl-11">
          <SessionPicker
            taskId={task.id}
            duration={task.duration}
            onSelect={() => setShowPicker(false)}
          />
        </div>
      )}

      {/* ─── Sección de micro-pasos ────────────────────────────────────── */}
      {(expanded || hasSubtasks) && (
        <div className="px-3 pb-3 pl-11 flex flex-col gap-1.5">
          {/* Lista de subtasks */}
          {task.subtasks.map((st) => (
            <div
              key={st.id}
              className="group/sub flex items-center gap-2 min-w-0"
            >
              <button
                onClick={() => toggleSubtask(task.id, st.id)}
                className={[
                  'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] transition-all active:scale-75',
                  st.completed
                    ? 'bg-success border-success text-white scale-100'
                    : 'border-border hover:border-primary hover:scale-105',
                ].join(' ')}
              >
                {st.completed && '✓'}
              </button>
              <span
                className={[
                  'text-sm leading-snug truncate flex-1',
                  st.completed
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground',
                ].join(' ')}
              >
                {st.title}
              </span>
              <button
                onClick={() => deleteSubtask(task.id, st.id)}
                className="text-muted-foreground hover:text-destructive transition-colors text-[10px] px-1 opacity-0 group-hover/sub:opacity-100"
                title="Eliminar micro-paso"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Input para agregar subtask */}
          <input
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="+ micro-paso (Enter)"
            className="bg-transparent border-b border-border text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary transition-colors w-full max-w-xs"
          />
        </div>
      )}
    </div>
  )
}
