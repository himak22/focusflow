import { useRef, useState } from 'react'
import { useAppStore } from '@/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { exportBackup, parseBackup } from '../lib/backup'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-10 h-6 rounded-full transition-colors overflow-hidden',
          checked ? 'bg-primary' : 'bg-muted-foreground/30',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

export function SettingsDialog() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const loadBackup = useAppStore((s) => s.loadBackup)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importOk, setImportOk] = useState(false)

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null)
    setImportOk(false)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = parseBackup(ev.target?.result as string)
        loadBackup(data)
        setImportOk(true)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Error al importar')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Dialog>
      <DialogTrigger
        title="Configuración"
        className="text-muted-foreground hover:text-foreground transition-colors text-base bg-transparent border-0 cursor-pointer p-0"
      >
        ⚙
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 pt-2">
          {/* Timer */}
          <Section title="Timer">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span>Trabajo</span>
                <span className="font-medium text-primary">{settings.workTime} min</span>
              </div>
              <Slider
                min={5}
                max={90}
                step={5}
                value={[settings.workTime]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v
                  updateSettings({ workTime: val })
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span>Descanso</span>
                <span className="font-medium text-[#3B82F6]">{settings.breakTime} min</span>
              </div>
              <Slider
                min={1}
                max={30}
                step={1}
                value={[settings.breakTime]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v
                  updateSettings({ breakTime: val })
                }}
              />
            </div>
          </Section>

          {/* Sonido */}
          <Section title="Sonido">
            <Toggle
              checked={settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
              label="Efectos de sonido"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-foreground">Ruido de fondo</span>
              <div className="flex gap-2">
                {(['off', 'brown', 'white'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateSettings({ ambientSound: type })}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      settings.ambientSound === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {type === 'off' ? 'Desact.' : type === 'brown' ? 'Marrón' : 'Blanco'}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Apariencia */}
          <Section title="Apariencia">
            <Toggle
              checked={settings.darkMode}
              onChange={(v) => updateSettings({ darkMode: v })}
              label="Modo oscuro"
            />
          </Section>

          {/* Datos */}
          <Section title="Datos">
            <div className="flex gap-2">
              <button
                onClick={exportBackup}
                className="flex-1 py-2 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Exportar JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Importar JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
            {importError && <p className="text-xs text-destructive">{importError}</p>}
            {importOk && (
              <p className="text-xs text-[#10B981]">Datos importados correctamente</p>
            )}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
