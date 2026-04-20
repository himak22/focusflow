import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppStore, Task, TimerState, BackupData } from './types'

const DEFAULT_WORK_MINUTES = 25
const DEFAULT_BREAK_MINUTES = 5

const DEFAULT_TIMER: TimerState = {
  isRunning: false,
  mode: 'work',
  remainingSeconds: DEFAULT_WORK_MINUTES * 60,
  currentPomodoro: 0,
}

function toIso(): string {
  return new Date().toISOString()
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function uuid(): string {
  return crypto.randomUUID()
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────────────────
      tasks: [],
      sessions: [],
      selectedTaskId: null,
      pomodorosToday: 0,
      lastResetDate: todayIso(),
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
            // Solo una tarea puede estar in-progress
            if (status === 'in-progress' && t.status === 'in-progress') {
              return { ...t, status: 'pending' }
            }
            return t
          }),
        }))
      },

      selectTask: (id) => {
        const { setTaskStatus, selectedTaskId } = get()
        // Al deseleccionar, la tarea anterior vuelve a pending
        if (id === null && selectedTaskId) {
          setTaskStatus(selectedTaskId, 'pending')
        } else if (id !== null) {
          // setTaskStatus ya resetea cualquier otra tarea in-progress
          setTaskStatus(id, 'in-progress')
        }
        set({ selectedTaskId: id })
      },

      addSubtask: (taskId, title) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: [
                    ...t.subtasks,
                    { id: uuid(), title, completed: false },
                  ],
                }
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
                    st.id === subtaskId
                      ? { ...st, completed: !st.completed }
                      : st
                  ),
                }
              : t
          ),
        }))
      },

      // ─── Timer Actions ────────────────────────────────────────────────────
      startTimer: () => set((s) => ({ timer: { ...s.timer, isRunning: true } })),

      pauseTimer: () => set((s) => ({ timer: { ...s.timer, isRunning: false } })),

      resetTimer: () => {
        const { settings } = get()
        set((s) => ({
          timer: {
            ...s.timer,
            isRunning: false,
            remainingSeconds:
              s.timer.mode === 'work'
                ? settings.workTime * 60
                : settings.breakTime * 60,
          },
        }))
      },

      skipToBreak: () => {
        const { settings } = get()
        set((s) => ({
          timer: {
            ...s.timer,
            isRunning: false,
            mode: s.timer.mode === 'work' ? 'break' : 'work',
            remainingSeconds:
              s.timer.mode === 'work'
                ? settings.breakTime * 60
                : settings.workTime * 60,
          },
        }))
      },

      setTimerMode: (mode) => {
        const { settings } = get()
        set((s) => ({
          timer: {
            ...s.timer,
            isRunning: false,
            mode,
            remainingSeconds:
              mode === 'work'
                ? settings.workTime * 60
                : settings.breakTime * 60,
          },
        }))
      },

      setTimerDuration: (minutes) => {
        set((s) => ({
          timer: {
            ...s.timer,
            isRunning: false,
            remainingSeconds: minutes * 60,
          },
          settings: {
            ...s.settings,
            [s.timer.mode === 'work' ? 'workTime' : 'breakTime']: minutes,
          },
        }))
      },

      tick: () => {
        const { timer, completePomodoro } = get()
        if (!timer.isRunning) return

        if (timer.remainingSeconds <= 1) {
          completePomodoro()
          return
        }

        set((s) => ({
          timer: { ...s.timer, remainingSeconds: s.timer.remainingSeconds - 1 },
        }))
      },

      // ─── Session / Pomodoro completion ────────────────────────────────────
      completePomodoro: () => {
        const { timer, selectedTaskId, settings } = get()
        const isWorkSession = timer.mode === 'work'

        if (isWorkSession && selectedTaskId) {
          // Registrar sesión completada
          const session = {
            taskId: selectedTaskId,
            duration: settings.workTime,
            completedAt: toIso(),
          }
          set((s) => ({
            sessions: [...s.sessions, session],
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
              ...s.timer,
              isRunning: false,
              mode: 'break',
              remainingSeconds: settings.breakTime * 60,
              currentPomodoro: s.timer.currentPomodoro + 1,
            },
          }))
        } else {
          // Break terminó → volver a work
          set((s) => ({
            timer: {
              ...s.timer,
              isRunning: false,
              mode: 'work',
              remainingSeconds: settings.workTime * 60,
            },
          }))
        }
      },

      syncTimerSeconds: (remainingSeconds) => {
        set((s) => ({ timer: { ...s.timer, remainingSeconds } }))
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
          lastResetDate: data.lastResetDate ?? todayIso(),
          selectedTaskId: null,
          transition: null,
          timer: { ...DEFAULT_TIMER },
        })
      },

      // ─── Daily reset ──────────────────────────────────────────────────────
      checkDailyReset: () => {
        const { lastResetDate } = get()
        const today = todayIso()
        if (lastResetDate !== today) {
          set((s) => ({
            pomodorosToday: 0,
            lastResetDate: today,
            selectedTaskId: null,
            timer: { ...DEFAULT_TIMER },
            // Limpiar tareas que quedaron in-progress del día anterior
            tasks: s.tasks.map((t) =>
              t.status === 'in-progress' ? { ...t, status: 'pending' } : t
            ),
          }))
        }
      },
    }),
    {
      name: 'focusflow-store',
      // El timer no se persiste — se resetea al reabrir la app
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
