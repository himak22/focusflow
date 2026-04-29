import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { AppLayout } from '@/features/layout'
import { useTimerWorker, useWakeLock } from '@/features/timer'
import { useSoundFX, useAmbientSound } from '@/features/feedback'
import { isTimerRunning } from '@/store'

export default function App() {
  const darkMode = useAppStore((s) => s.settings.darkMode)
  const checkDailyReset = useAppStore((s) => s.checkDailyReset)
  const timerStatus = useAppStore((s) => s.timer.status)

  // Timer
  useTimerWorker()
  useWakeLock(isTimerRunning(timerStatus))

  // Feedback
  useSoundFX()
  useAmbientSound()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    checkDailyReset()
  }, [checkDailyReset])

  return <AppLayout />
}
