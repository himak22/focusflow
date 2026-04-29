import { useAppStore, getTimerMode, isTimerRunning } from '@/store'
import { CircularProgress } from './CircularProgress'
import { TimerControls } from './TimerControls'
import { copyFocusMessage } from '../lib/focusMessage'

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
  const startQuickSession = useAppStore((s) => s.startQuickSession)

  const activeTask = tasks.find((t) => t.id === selectedTaskId) ?? null
  const mode = getTimerMode(timer.status)
  const totalSeconds = mode === 'work' ? workTime * 60 : breakTime * 60
  const progress = totalSeconds > 0 ? timer.remainingSeconds / totalSeconds : 1
  const color = mode === 'work' ? WORK_COLOR : BREAK_COLOR

  function handleFiveMin() {
    startQuickSession(5)
  }

  return (
    <section className="border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
      <div className="max-w-2xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* Circular timer — izquierda, GRANDE */}
        <CircularProgress
          progress={progress}
          size={160}
          strokeWidth={8}
          color={color}
          trackColor={color}
        >
          <div className="flex flex-col items-center leading-none">
            <span
              className="text-3xl font-mono font-bold tabular-nums"
              style={{ color }}
            >
              {formatTime(timer.remainingSeconds)}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">
              {mode === 'work' ? 'trabajo' : 'break'}
            </span>
          </div>
        </CircularProgress>

        {/* Derecha: tarea activa + controles */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 pt-2">
          {/* Tarea activa — JERARQUÍA VISUAL FUERTE */}
          {activeTask ? (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                  🎯 Modo enfoque
                </p>
                <p className="text-xl font-bold text-foreground leading-tight truncate">
                  {activeTask.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅
                  {activeTask.isQuickWin && ' · ⚡ Quick win'}
                </p>
              </div>
              <button
                onClick={() => selectTask(null)}
                title="Salir del modo enfoque"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-5"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-base text-muted-foreground">
                Seleccioná una tarea para el modo enfoque
              </p>
              <button
                onClick={handleFiveMin}
                className="self-start text-sm font-semibold px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>⚡</span>
                <span>Solo 5 min</span>
              </button>
            </div>
          )}

          {/* Controles */}
          <TimerControls />

          {/* Distraction Shield — solo en focus mode + timer corriendo */}
          {activeTask && isTimerRunning(timer.status) && mode === 'work' && (
            <button
              onClick={() => copyFocusMessage(timer.remainingSeconds)}
              className="self-start flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 active:scale-95 transition-all"
              title="Copiar mensaje para Slack/Teams/WhatsApp"
            >
              <span className="text-sm">📋</span>
              <span>Copiar mensaje de enfoque</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
