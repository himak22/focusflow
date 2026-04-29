import { useState } from 'react'
import { AppHeader, type AppView } from './AppHeader'
import { HeroTimer } from '@/features/timer'
import { FocusModeGate, TransitionOverlay } from '@/features/tasks'
import { Toaster } from '@/components/ui/sonner'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function AppLayout() {
  useKeyboardShortcuts()
  const [view, setView] = useState<AppView>('tasks')

  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppHeader view={view} setView={setView} />

      {/* Extra padding for header + nav tabs (14 height header + ~36px tabs) */}
      <div className="pt-[88px]">
        <HeroTimer />

        <main className="max-w-2xl mx-auto px-4 py-6">
          {view === 'tasks' && <FocusModeGate />}
        </main>
      </div>

      <TransitionOverlay />
      <Toaster position="top-center" richColors />
    </div>
  )
}
