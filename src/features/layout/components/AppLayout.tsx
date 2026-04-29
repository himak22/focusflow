import { useState } from 'react'
import { AppHeader } from './AppHeader'
import { HeroTimer } from '@/features/timer'
import { FocusModeGate, TransitionOverlay } from '@/features/tasks'
import { Toaster } from '@/components/ui/sonner'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

export function AppLayout() {
  const [showHelp, setShowHelp] = useState(false)

  useKeyboardShortcuts({ showHelp, setShowHelp })

  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppHeader />

      {/* Extra padding for fixed header */}
      <div className="pt-14">
        <HeroTimer />

        <main className="max-w-2xl mx-auto px-4 py-6">
          <FocusModeGate />
        </main>
      </div>

      <TransitionOverlay />
      {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />}
      <Toaster position="top-center" richColors />
    </div>
  )
}
