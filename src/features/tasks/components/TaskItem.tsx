import { useState, type KeyboardEvent, useRef, useEffect } from 'react'
import { useAppStore } from '@/store'
import type { Task } from '@/store'

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

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPomos, setEditPomos] = useState(task.estimatedPomodoros)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

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

          {/* Pomodoros estimados — doble click para editar */}
          {task.estimatedPomodoros > 0 && (
            <button
              onDoubleClick={startEdit}
              className="text-xs text-muted-foreground flex-shrink-0"
              title="Doble click para editar"
            >
              {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
            </button>
          )}
        </>
      )}

      {/* Estado in-progress */}
      {task.status === 'in-progress' && !isEditing && (
        <span className="text-xs font-medium text-primary flex-shrink-0">
          Activa
        </span>
      )}

      {/* Acciones — visibles solo en hover y cuando NO está editando */}
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
  )
}
