import { useAppStore } from '@/store'
import type { BackupData } from '@/store'

export function exportBackup() {
  const s = useAppStore.getState()
  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: s.tasks,
    sessions: s.sessions,
    settings: s.settings,
    pomodorosToday: s.pomodorosToday,
    lastResetDate: s.lastResetDate,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `focusflow-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(json: string): BackupData {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('El archivo no es un JSON válido')
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Formato inválido')
  }

  const d = data as Record<string, unknown>

  if (!Array.isArray(d.tasks)) throw new Error('El campo "tasks" debe ser un array')
  if (!Array.isArray(d.sessions)) throw new Error('El campo "sessions" debe ser un array')
  if (!d.settings || typeof d.settings !== 'object' || Array.isArray(d.settings)) {
    throw new Error('El campo "settings" debe ser un objeto')
  }
  if (typeof d.pomodorosToday !== 'number') {
    throw new Error('El campo "pomodorosToday" debe ser un número')
  }
  if (typeof d.lastResetDate !== 'string') {
    throw new Error('El campo "lastResetDate" debe ser una cadena')
  }

  return d as unknown as BackupData
}
