import { useAppStore, isTimerRunning } from '@/store'
import { generateSessionOptions } from '@/features/timer/lib/duration'

interface SessionPickerProps {
  taskId: string
  duration: number
  onSelect: () => void
}

export function SessionPicker({ taskId, duration, onSelect }: SessionPickerProps) {
  const setTimerDuration = useAppStore((s) => s.setTimerDuration)
  const selectTask = useAppStore((s) => s.selectTask)
  const timerStatus = useAppStore((s) => s.timer.status)

  const options = generateSessionOptions(duration)

  function handleOption(workMinutes: number) {
    setTimerDuration(workMinutes)
    selectTask(taskId)
    onSelect()
  }

  // Si el timer está corriendo, no mostrar picker (evitar interrumpir)
  if (isTimerRunning(timerStatus)) {
    return null
  }

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      <p className="text-[10px] text-muted-foreground">
        ¿Cómo querés dividir esta tarea?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.sessions}
            onClick={() => handleOption(opt.workMinutes)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
