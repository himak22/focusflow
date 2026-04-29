import { describe, it, expect } from 'vitest'
import { parseBackup } from './backup'

const VALID_BACKUP = JSON.stringify({
  version: 1,
  exportedAt: '2026-04-20T10:00:00.000Z',
  tasks: [],
  sessions: [],
  settings: { workTime: 25, breakTime: 5, soundEnabled: true, darkMode: false, ambientSound: 'off' },
  pomodorosToday: 0,
  lastResetDate: '2026-04-20',
})

describe('parseBackup', () => {
  it('parses a valid backup without throwing', () => {
    const result = parseBackup(VALID_BACKUP)
    expect(result.tasks).toEqual([])
    expect(result.sessions).toEqual([])
    expect(result.settings.workTime).toBe(25)
  })

  it('throws on malformed JSON', () => {
    expect(() => parseBackup('not json{')).toThrow('JSON válido')
  })

  it('throws when tasks field is missing', () => {
    const bad = JSON.stringify({ sessions: [], settings: {}, pomodorosToday: 0, lastResetDate: '2026-04-20' })
    expect(() => parseBackup(bad)).toThrow('"tasks"')
  })

  it('throws when sessions field is missing', () => {
    const bad = JSON.stringify({ tasks: [], settings: {}, pomodorosToday: 0, lastResetDate: '2026-04-20' })
    expect(() => parseBackup(bad)).toThrow('"sessions"')
  })

  it('throws when settings is not an object', () => {
    const bad = JSON.stringify({ tasks: [], sessions: [], settings: 'bad', pomodorosToday: 0, lastResetDate: '2026-04-20' })
    expect(() => parseBackup(bad)).toThrow('"settings"')
  })

  it('throws when pomodorosToday is not a number', () => {
    const bad = JSON.stringify({ tasks: [], sessions: [], settings: {}, pomodorosToday: 'bad', lastResetDate: '2026-04-20' })
    expect(() => parseBackup(bad)).toThrow('"pomodorosToday"')
  })
})
