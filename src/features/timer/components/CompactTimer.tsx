import { useAppStore, getTimerMode } from '@/store'
import { CircularProgress } from './CircularProgress'

const WORK_COLOR = '#F97316'
const BREAK_COLOR = '#3B82F6'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function CompactTimer() {
  const timer = useAppStore((s) => s.timer)
  const workTime = useAppStore((s) => s.settings.workTime)
  const breakTime = useAppStore((s) => s.settings.breakTime)

  const mode = getTimerMode(timer.status)
  const totalSeconds = mode === 'work' ? workTime * 60 : breakTime * 60
  const progress = totalSeconds > 0 ? timer.remainingSeconds / totalSeconds : 1
  const color = mode === 'work' ? WORK_COLOR : BREAK_COLOR

  return (
    <div className="flex items-center gap-2">
      <CircularProgress
        progress={progress}
        size={36}
        strokeWidth={3}
        color={color}
        trackColor={color}
      >
        <span
          className="text-[9px] font-mono font-bold tabular-nums leading-none"
          style={{ color }}
        >
          {Math.ceil(timer.remainingSeconds / 60)}
        </span>
      </CircularProgress>

      <div className="flex flex-col leading-tight">
        <span
          className="text-sm font-mono font-semibold tabular-nums"
          style={{ color }}
        >
          {formatTime(timer.remainingSeconds)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {mode === 'work' ? 'trabajo' : 'descanso'}
        </span>
      </div>
    </div>
  )
}
