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
  const data = JSON.parse(json)
  if (!data || typeof data !== 'object') throw new Error('Formato inválido')
  if (!Array.isArray(data.tasks)) throw new Error('El campo "tasks" debe ser un array')
  return data as BackupData
}
