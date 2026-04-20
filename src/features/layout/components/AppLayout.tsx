import { AppHeader } from './AppHeader'
import { HeroTimer } from '@/features/timer'
import { FocusModeGate, TransitionOverlay } from '@/features/tasks'
import { Toaster } from '@/components/ui/sonner'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppHeader />

      <div className="pt-14">
        <HeroTimer />

        <main className="max-w-2xl mx-auto px-4 py-6">
          <FocusModeGate />
        </main>
      </div>

      <TransitionOverlay />
      <Toaster position="top-center" richColors />
    </div>
  )
}
