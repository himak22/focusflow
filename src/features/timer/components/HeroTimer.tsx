import { useAppStore } from '@/store'
import { CircularProgress } from './CircularProgress'
import { TimerControls } from './TimerControls'

const WORK_COLOR = '#F97316'
const BREAK_COLOR = '#3B82F6'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function HeroTimer() {
  const tasks = useAppStore((s) => s.tasks)
  const selectedTaskId = useAppStore((s) => s.selectedTaskId)
  const timer = useAppStore((s) => s.timer)
  const workTime = useAppStore((s) => s.settings.workTime)
  const breakTime = useAppStore((s) => s.settings.breakTime)
  const selectTask = useAppStore((s) => s.selectTask)
  const setTimerDuration = useAppStore((s) => s.setTimerDuration)
  const startTimer = useAppStore((s) => s.startTimer)

  const activeTask = tasks.find((t) => t.id === selectedTaskId) ?? null
  const isWork = timer.mode === 'work'
  const totalSeconds = isWork ? workTime * 60 : breakTime * 60
  const progress = totalSeconds > 0 ? timer.remainingSeconds / totalSeconds : 1
  const color = isWork ? WORK_COLOR : BREAK_COLOR

  function handleFiveMin() {
    setTimerDuration(5)
    startTimer()
  }

  return (
    <section className="border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
      <div className="max-w-2xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* Circular timer — izquierda */}
        <CircularProgress
          progress={progress}
          size={96}
          strokeWidth={6}
          color={color}
          trackColor={color}
        >
          <div className="flex flex-col items-center leading-none">
            <span
              className="text-lg font-mono font-bold tabular-nums"
              style={{ color }}
            >
              {formatTime(timer.remainingSeconds)}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              {isWork ? 'trabajo' : 'break'}
            </span>
          </div>
        </CircularProgress>

        {/* Derecha: tarea activa + controles */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Tarea activa */}
          {activeTask ? (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-0.5">
                  Modo enfoque
                </p>
                <p className="text-base font-semibold text-foreground truncate">
                  {activeTask.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅
                  {activeTask.isQuickWin && ' · ⚡ Quick win'}
                </p>
              </div>
              <button
                onClick={() => selectTask(null)}
                title="Salir del modo enfoque"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Seleccioná una tarea para el modo enfoque
              </p>
              <button
                onClick={handleFiveMin}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
              >
                Solo 5 min ⚡
              </button>
            </div>
          )}

          {/* Controles */}
          <TimerControls />
        </div>
      </div>
    </section>
  )
}
