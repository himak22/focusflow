import { useState } from 'react'
import { AppHeader, type AppView } from './AppHeader'
import { HeroTimer } from '@/features/timer'
import { FocusModeGate, TransitionOverlay } from '@/features/tasks'
import { Toaster } from '@/components/ui/sonner'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

export function AppLayout() {
  const [view, setView] = useState<AppView>('tasks')
  const [showHelp, setShowHelp] = useState(false)

  useKeyboardShortcuts({ showHelp, setShowHelp })

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
      {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />}
      <Toaster position="top-center" richColors />
    </div>
  )
}
