import { useState, type KeyboardEvent } from 'react'
import { useAppStore } from '@/store'

interface TaskInputProps {
  tag: string
}

export function TaskInput({ tag }: TaskInputProps) {
  const [value, setValue] = useState('')
  const [duration, setDuration] = useState('')
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

    const dur = parseInt(duration, 10)
    if (!Number.isNaN(dur) && dur > 0) {
      payload.duration = dur
    }

    addTask(payload)
    setValue('')
    setDuration('')
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

        {/* Duración personalizada */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={180}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="min"
            className="w-12 bg-transparent border-b border-border text-xs text-center outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors py-2"
            title="Duración en minutos (opcional)"
          />
        </div>

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
        Enter para guardar · Duración opcional (usa el default si no la ponés)
      </p>
    </div>
  )
}
