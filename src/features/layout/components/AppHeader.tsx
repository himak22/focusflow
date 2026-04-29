import { useAppStore } from '@/store'
import { CompactTimer } from '@/features/timer'
import { SettingsDialog } from '@/features/settings'

export function AppHeader() {
  const pomodorosToday = useAppStore((s) => s.pomodorosToday)
  const darkMode = useAppStore((s) => s.settings.darkMode)
  const updateSettings = useAppStore((s) => s.updateSettings)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <span className="font-semibold text-base tracking-tight text-foreground select-none">
          Focus<span className="text-primary">Flow</span>
        </span>

        {/* Timer compacto */}
        <CompactTimer />

        {/* Controles */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            🍅 <span className="font-medium text-foreground">{pomodorosToday}</span> hoy
          </span>
          <button
            onClick={() => updateSettings({ darkMode: !darkMode })}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            className="text-muted-foreground hover:text-foreground transition-colors text-base"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <SettingsDialog />
        </div>
      </div>

    </header>
  )
}
