import { useAppStore, getTimerMode, isTimerRunning } from '@/store'

const QUICK_DURATIONS = [5, 15, 25, 50] as const

export function TimerControls() {
  const status = useAppStore((s) => s.timer.status)
  const mode = getTimerMode(status)
  const workTime = useAppStore((s) => s.settings.workTime)
  const breakTime = useAppStore((s) => s.settings.breakTime)
  const startTimer = useAppStore((s) => s.startTimer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const resetTimer = useAppStore((s) => s.resetTimer)
  const skipBreak = useAppStore((s) => s.skipBreak)
  const setTimerDuration = useAppStore((s) => s.setTimerDuration)

  const running = isTimerRunning(status)
  const currentMinutes = mode === 'work' ? workTime : breakTime

  return (
    <div className="flex flex-col gap-3">
      {/* Botones principales */}
      <div className="flex items-center gap-2">
        <button
          onClick={running ? pauseTimer : startTimer}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:opacity-90 active:scale-95"
        >
          {running ? '⏸ Pausar' : '▶ Iniciar'}
        </button>

        <button
          onClick={resetTimer}
          title="Reiniciar"
          className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          ↺
        </button>

        {(status === 'break_running' || status === 'break_paused') && (
          <button
            onClick={skipBreak}
            title="Saltar descanso"
            className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            ⏭
          </button>
        )}
      </div>

      {/* Duraciones rápidas — solo en modo work y cuando NO está corriendo break */}
      {mode === 'work' && status !== 'break_running' && status !== 'break_paused' && (
        <div className="flex gap-1.5">
          {QUICK_DURATIONS.map((min) => (
            <button
              key={min}
              onClick={() => setTimerDuration(min)}
              className={[
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                currentMinutes === min
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              ].join(' ')}
            >
              {min}m
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
