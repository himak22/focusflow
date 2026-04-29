import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppStore, Task, TimerState, BackupData } from './types'
import { isTimerRunning, getTimerMode } from './types'
import { timerService } from '@/features/timer/services'

const DEFAULT_WORK_MINUTES = 25
const DEFAULT_BREAK_MINUTES = 5

const DEFAULT_TIMER: TimerState = {
  status: 'idle',
  remainingSeconds: DEFAULT_WORK_MINUTES * 60,
  currentPomodoro: 0,
}

/** Fecha local del usuario en formato YYYY-MM-DD */
function todayLocal(): string {
  return new Date().toLocaleDateString('sv-SE')
}

function toIso(): string {
  return new Date().toISOString()
}

function uuid(): string {
  return crypto.randomUUID()
}

function breakTimeFor(workMinutes: number): number {
  if (workMinutes >= 90) return 20
  if (workMinutes >= 60) return 15
  if (workMinutes >= 45) return 10
  return DEFAULT_BREAK_MINUTES
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────────────────
      tasks: [],
      sessions: [],
      selectedTaskId: null,
      pomodorosToday: 0,
      lastResetDate: todayLocal(),
      timer: { ...DEFAULT_TIMER },
      transition: null,
      settings: {
        workTime: DEFAULT_WORK_MINUTES,
        breakTime: DEFAULT_BREAK_MINUTES,
        soundEnabled: true,
        darkMode: false,
        ambientSound: 'off' as const,
      },

      // ─── Task Actions ─────────────────────────────────────────────────────
      addTask: (taskInput) => {
        const task: Task = {
          id: uuid(),
          createdAt: toIso(),
          lastWorkedAt: null,
          completedPomodoros: 0,
          subtasks: [],
          ...taskInput,
        }
        set((s) => ({ tasks: [...s.tasks, task] }))
      },

      updateTask: (id, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }))
      },

      deleteTask: (id) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
        }))
      },

      setTaskStatus: (id, status) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id === id) return { ...t, status }
            if (status === 'in-progress' && t.status === 'in-progress') {
              return { ...t, status: 'pending' }
            }
            return t
          }),
        }))
      },

      selectTask: (id) => {
        const { setTaskStatus, selectedTaskId } = get()
        if (id === null && selectedTaskId) {
          setTaskStatus(selectedTaskId, 'pending')
        } else if (id !== null) {
          setTaskStatus(id, 'in-progress')
        }
        set({ selectedTaskId: id })
      },

      // ─── Subtask Actions ──────────────────────────────────────────────────
      addSubtask: (taskId, title) => {
        const trimmed = title.trim()
        if (!trimmed) return
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, { id: uuid(), title: trimmed, completed: false }] }
              : t
          ),
        }))
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : t
          ),
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
              : t
          ),
        }))
      },

      // ─── Timer Actions — públicas (UI) ────────────────────────────────────
      startTimer: () => {
        const { timer } = get()
        const canStart =
          timer.status === 'idle' ||
          timer.status === 'work_ready' ||
          timer.status === 'break_ready' ||
          timer.status === 'work_paused' ||
          timer.status === 'break_paused'

        if (!canStart) return

        const nextStatus =
          timer.status === 'break_ready' || timer.status === 'break_paused'
            ? 'break_running'
            : 'work_running'

        timerService.start(timer.remainingSeconds)
        set((s) => ({ timer: { ...s.timer, status: nextStatus } }))
      },

      pauseTimer: () => {
        const { timer } = get()
        if (!isTimerRunning(timer.status)) return

        const nextStatus =
          timer.status === 'work_running' ? 'work_paused' : 'break_paused'

        timerService.pause()
        set({ timer: { ...get().timer, status: nextStatus } })
      },

      resetTimer: () => {
        const { settings } = get()
        timerService.reset(settings.workTime * 60)
        set({
          timer: {
            status: 'idle',
            remainingSeconds: settings.workTime * 60,
            currentPomodoro: 0,
          },
        })
      },

      skipBreak: () => {
        const { timer, settings } = get()
        const canSkip =
          timer.status === 'break_running' || timer.status === 'break_paused'
        if (!canSkip) return

        timerService.reset(settings.workTime * 60)
        set({
          timer: {
            ...get().timer,
            status: 'work_ready',
            remainingSeconds: settings.workTime * 60,
          },
        })
      },

      setTimerDuration: (minutes) => {
        const { timer } = get()
        const mode = getTimerMode(timer.status)
        const isIdle = !isTimerRunning(timer.status)

        if (!isIdle) return // solo en estados detenidos

        set((s) => ({
          timer: {
            ...s.timer,
            remainingSeconds: minutes * 60,
          },
          settings: {
            ...s.settings,
            [mode === 'work' ? 'workTime' : 'breakTime']: minutes,
          },
        }))
      },

      startQuickSession: (minutes) => {
        const remaining = minutes * 60
        timerService.start(remaining)
        set((s) => ({
          timer: {
            ...s.timer,
            status: 'work_running',
            remainingSeconds: remaining,
          },
        }))
      },

      startBreak: () => {
        const { settings } = get()
        const remaining = settings.breakTime * 60
        timerService.start(remaining)
        set({
          timer: {
            status: 'break_running',
            remainingSeconds: remaining,
            currentPomodoro: get().timer.currentPomodoro,
          },
        })
      },

      // ─── Timer Actions — internas (TimerService únicamente) ───────────────
      _syncTimerSeconds: (remainingSeconds) => {
        set((s) => ({ timer: { ...s.timer, remainingSeconds } }))
      },

      _completePomodoro: () => {
        const { timer, selectedTaskId, settings } = get()
        const mode = getTimerMode(timer.status)

        if (mode === 'work') {
          // Work completado → break_ready
          const session = {
            taskId: selectedTaskId ?? '',
            duration: settings.workTime,
            completedAt: toIso(),
          }

          set((s) => {
            const newSessions = [...s.sessions, session]
            const cappedSessions = newSessions.length > 500 ? newSessions.slice(-500) : newSessions

            return {
              sessions: cappedSessions,
              pomodorosToday: s.pomodorosToday + 1,
              tasks: s.tasks.map((t) =>
                t.id === selectedTaskId
                  ? {
                      ...t,
                      completedPomodoros: t.completedPomodoros + 1,
                      lastWorkedAt: toIso(),
                    }
                  : t
              ),
              timer: {
                status: 'break_ready',
                remainingSeconds: breakTimeFor(settings.workTime) * 60,
                currentPomodoro: s.timer.currentPomodoro + 1,
              },
            }
          })
        } else {
          // Break completado → work_ready
          set((s) => ({
            timer: {
              status: 'work_ready',
              remainingSeconds: settings.workTime * 60,
              currentPomodoro: s.timer.currentPomodoro,
            },
          }))
        }
      },

      // ─── Transition ───────────────────────────────────────────────────────
      triggerTransition: (taskTitle) => {
        set({ transition: { taskTitle } })
      },

      clearTransition: () => {
        set({ transition: null })
      },

      // ─── Settings ─────────────────────────────────────────────────────────
      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }))
      },

      // ─── Data backup ──────────────────────────────────────────────────────
      loadBackup: (data: BackupData) => {
        set({
          tasks: data.tasks ?? [],
          sessions: data.sessions ?? [],
          settings: { ...get().settings, ...data.settings },
          pomodorosToday: data.pomodorosToday ?? 0,
          lastResetDate: data.lastResetDate ?? todayLocal(),
          selectedTaskId: null,
          transition: null,
          timer: { ...DEFAULT_TIMER },
        })
      },

      // ─── Daily reset ──────────────────────────────────────────────────────
      checkDailyReset: () => {
        const { lastResetDate } = get()
        const today = todayLocal()
        if (lastResetDate !== today) {
          set({
            pomodorosToday: 0,
            lastResetDate: today,
          })
        }
      },
    }),
    {
      name: 'focusflow-store',
      version: 1,
      migrate: (persistedState: unknown, version) => {
        const state = persistedState as Record<string, unknown>

        // ─── Versión 0 → 1: migrar modelo de datos ────────────────────────
        if (version < 1) {
          // 1. Tasks: source → tags + subtasks default
          if (Array.isArray(state.tasks)) {
            state.tasks = state.tasks.map((task: any) => {
              if (!Array.isArray(task.tags)) {
                task.tags = task.source ? [task.source] : ['inbox']
              }
              if (!Array.isArray(task.subtasks)) {
                task.subtasks = []
              }
              return task
            })
          }

          // 2. Timer: isRunning/mode → status
          const timer = state.timer as any
          if (timer && !timer.status) {
            const wasRunning = timer.isRunning
            const mode = timer.mode ?? 'work'
            if (wasRunning) {
              timer.status = mode === 'work' ? 'work_running' : 'break_running'
            } else {
              timer.status = 'idle'
            }
            if (typeof timer.currentPomodoro !== 'number') {
              timer.currentPomodoro = 0
            }
          }

          // 3. Settings: eliminar campos viejos, asegurar defaults
          const oldSettings = (state.settings as any) ?? {}
          state.settings = {
            workTime: oldSettings.workTime ?? DEFAULT_WORK_MINUTES,
            breakTime: oldSettings.breakTime ?? DEFAULT_BREAK_MINUTES,
            soundEnabled: oldSettings.soundEnabled ?? true,
            darkMode: oldSettings.darkMode ?? false,
            ambientSound: oldSettings.ambientSound ?? 'off',
          }

          // 4. Eliminar campos V2 que ya no existen
          delete (state as any).objectives
          delete (state as any).stats
          delete (state as any).transition
        }

        return state as any
      },
      partialize: (state) => ({
        tasks: state.tasks,
        sessions: state.sessions,
        selectedTaskId: state.selectedTaskId,
        pomodorosToday: state.pomodorosToday,
        lastResetDate: state.lastResetDate,
        settings: state.settings,
      }),
    }
  )
)
