import { useAppStore } from '@/store'

const QUICK_DURATIONS = [5, 15, 25, 50] as const

export function TimerControls() {
  const isRunning = useAppStore((s) => s.timer.isRunning)
  const mode = useAppStore((s) => s.timer.mode)
  const workTime = useAppStore((s) => s.settings.workTime)
  const breakTime = useAppStore((s) => s.settings.breakTime)
  const startTimer = useAppStore((s) => s.startTimer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const resetTimer = useAppStore((s) => s.resetTimer)
  const skipToBreak = useAppStore((s) => s.skipToBreak)
  const setTimerDuration = useAppStore((s) => s.setTimerDuration)

  const currentMinutes = mode === 'work' ? workTime : breakTime

  return (
    <div className="flex flex-col gap-3">
      {/* Botones principales */}
      <div className="flex items-center gap-2">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:opacity-90 active:scale-95"
        >
          {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
        </button>

        <button
          onClick={resetTimer}
          title="Reiniciar"
          className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          ↺
        </button>

        <button
          onClick={skipToBreak}
          title={mode === 'work' ? 'Saltar a descanso' : 'Saltar a trabajo'}
          className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          ⏭
        </button>
      </div>

      {/* Duraciones rápidas — solo en modo work */}
      {mode === 'work' && (
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
