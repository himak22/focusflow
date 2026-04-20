import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { AppLayout } from '@/features/layout'
import { useTimerWorker, useWakeLock } from '@/features/timer'
import { useSoundFX, useAmbientSound } from '@/features/feedback'

export default function App() {
  const darkMode = useAppStore((s) => s.settings.darkMode)
  const checkDailyReset = useAppStore((s) => s.checkDailyReset)
  const isTimerRunning = useAppStore((s) => s.timer.isRunning)

  // Timer
  useTimerWorker()
  useWakeLock(isTimerRunning)

  // Feedback dopamina
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
