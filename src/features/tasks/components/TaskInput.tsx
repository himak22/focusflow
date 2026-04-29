import { useState, type KeyboardEvent } from 'react'
import { useAppStore } from '@/store'

interface TaskInputProps {
  tag: string
}

export function TaskInput({ tag }: TaskInputProps) {
  const [value, setValue] = useState('')
  const [isQuickWin, setIsQuickWin] = useState(false)
  const addTask = useAppStore((s) => s.addTask)

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const title = value.trim()
    if (!title) return

    addTask({
      title,
      status: 'pending',
      estimatedPomodoros: 1,
      isQuickWin,
      tags: [tag],
    })

    setValue('')
    setIsQuickWin(false)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nueva tarea… (Enter para guardar)"
        data-task-input
        className="flex-1 bg-transparent border-b border-border px-1 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
      />
      <button
        onClick={() => setIsQuickWin((v) => !v)}
        title="Marcar como quick win (<5 min)"
        className={[
          'text-lg transition-opacity',
          isQuickWin ? 'opacity-100' : 'opacity-30 hover:opacity-60',
        ].join(' ')}
      >
        ⚡
      </button>
    </div>
  )
}
