import { useState, type KeyboardEvent } from 'react'
import { useAppStore } from '@/store'
import { parseDuration } from '@/features/timer/lib/duration'

interface TaskInputProps {
  tag: string
}

export function TaskInput({ tag }: TaskInputProps) {
  const [value, setValue] = useState('')
  const [durationRaw, setDurationRaw] = useState('')
  const [isQuickWin, setIsQuickWin] = useState(false)
  const addTask = useAppStore((s) => s.addTask)

  function submit() {
    const title = value.trim()
    if (!title) return

    const payload: Parameters<typeof addTask>[0] = {
      title,
      status: 'pending',
      estimatedPomodoros: 1,
      isQuickWin,
      tags: [tag],
    }

    const dur = parseDuration(durationRaw)
    if (dur !== null) {
      payload.duration = dur
    }

    addTask(payload)
    setValue('')
    setDurationRaw('')
    setIsQuickWin(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nueva tarea…"
          data-task-input
          className="flex-1 bg-transparent border-b border-border px-1 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
        />

        {/* Duración personalizada — acepta "90", "2h", "1.5h" */}
        <input
          type="text"
          value={durationRaw}
          onChange={(e) => setDurationRaw(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="2h"
          className="w-14 bg-transparent border-b border-border text-xs text-center outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors py-2"
          title="Duración: 90, 2h, 1.5h..."
        />

        <button
          onClick={() => setIsQuickWin((v) => !v)}
          title="Marcar como quick win (<5 min)"
          className={[
            'text-lg transition-opacity px-1',
            isQuickWin ? 'opacity-100' : 'opacity-30 hover:opacity-60',
          ].join(' ')}
        >
          ⚡
        </button>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground/60">
        Enter para guardar · Duración opcional: 90, 2h, 1.5h...
      </p>
    </div>
  )
}
