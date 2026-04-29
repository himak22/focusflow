import { useState, type KeyboardEvent } from 'react'
import { useAppStore } from '@/store'

interface TaskInputProps {
  tag: string
}

export function TaskInput({ tag }: TaskInputProps) {
  const [value, setValue] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
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

    const h = parseInt(hours, 10)
    const m = parseInt(minutes, 10)
    const totalMinutes = (Number.isNaN(h) ? 0 : h * 60) + (Number.isNaN(m) ? 0 : m)
    if (totalMinutes > 0) {
      payload.duration = totalMinutes
    }

    addTask(payload)
    setValue('')
    setHours('')
    setMinutes('')
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

        {/* Horas */}
        <div className="flex items-center gap-0.5">
          <input
            type="number"
            min={0}
            max={10}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="h"
            className="w-10 bg-transparent border-b border-border text-xs text-center outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors py-2"
            title="Horas"
          />
          <span className="text-[10px] text-muted-foreground">h</span>
        </div>

        {/* Minutos */}
        <div className="flex items-center gap-0.5">
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="m"
            className="w-10 bg-transparent border-b border-border text-xs text-center outline-none placeholder:text-muted-foreground/50 focus:border-primary transition-colors py-2"
            title="Minutos"
          />
          <span className="text-[10px] text-muted-foreground">m</span>
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
        Enter para guardar · Tiempo opcional (usa el default si no lo ponés)
      </p>
    </div>
  )
}
