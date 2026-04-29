import { useEffect } from 'react'

interface Shortcut {
  key: string
  action: string
  condition?: string
}

const SHORTCUTS: Shortcut[] = [
  { key: 'Space', action: 'Iniciar / Pausar timer' },
  { key: 'Esc', action: 'Cerrar ayuda → overlay → modo enfoque' },
  { key: '/', action: 'Nueva tarea' },
  { key: 'R', action: 'Reiniciar timer' },
  { key: '?', action: 'Mostrar / ocultar esta ayuda' },
]

export function KeyboardShortcutsHelp({ onClose }: { onClose: () => void }) {
  // Cerrar con click fuera
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Atajos de teclado</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xs px-1"
          >
            ✕
          </button>
        </div>

        {/* Lista */}
        <div className="p-5 flex flex-col gap-3">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <kbd className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-muted text-xs font-mono font-semibold text-foreground border border-border">
                {s.key}
              </kbd>
              <span className="text-sm text-foreground flex-1 text-right">{s.action}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-muted/50 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">
            Los atajos funcionan solo cuando no estás escribiendo en un campo de texto.
          </p>
        </div>
      </div>
    </div>
  )
}
