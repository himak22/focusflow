// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string       // ISO 8601
  lastWorkedAt: string | null  // ISO 8601
  estimatedPomodoros: number
  completedPomodoros: number
  isQuickWin: boolean
  tags: string[]          // V1: 'inbox' | 'today'
}

// ─── Pomodoro / Sessions ──────────────────────────────────────────────────────

export interface PomodoroSession {
  taskId: string
  duration: number    // minutos
  completedAt: string // ISO 8601
}

// ─── Timer ───────────────────────────────────────────────────────────────────

export type TimerStatus =
  | 'idle'
  | 'work_running'
  | 'work_paused'
  | 'break_ready'
  | 'break_running'
  | 'break_paused'
  | 'work_ready'

export interface TimerState {
  status: TimerStatus
  remainingSeconds: number
  currentPomodoro: number  // pomodoros de WORK completados en la sesión actual (desde último reset)
}

export function isTimerRunning(status: TimerStatus): boolean {
  return status === 'work_running' || status === 'break_running'
}

export function getTimerMode(status: TimerStatus): 'work' | 'break' {
  if (status.includes('break')) return 'break'
  return 'work'
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  workTime: number   // minutos
  breakTime: number  // minutos
  soundEnabled: boolean
  darkMode: boolean
  ambientSound: 'off' | 'brown' | 'white'
}

// ─── Transition ──────────────────────────────────────────────────────────────

export interface Transition {
  taskTitle: string
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  tasks: Task[]
  sessions: PomodoroSession[]
  selectedTaskId: string | null
  pomodorosToday: number
  lastResetDate: string   // YYYY-MM-DD local del usuario
  timer: TimerState
  settings: Settings
  transition: Transition | null  // no persistida
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface AppActions {
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'lastWorkedAt' | 'completedPomodoros'>) => void
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (id: string) => void
  setTaskStatus: (id: string, status: Task['status']) => void
  selectTask: (id: string | null) => void

  // Timer — públicas (llamadas por UI)
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipBreak: () => void
  setTimerDuration: (minutes: number) => void
  startQuickSession: (minutes: number) => void
  startBreak: () => void

  // Timer — internas (llamadas solo por TimerService)
  _syncTimerSeconds: (remainingSeconds: number) => void
  _completePomodoro: () => void

  // Settings
  updateSettings: (patch: Partial<Settings>) => void

  // Transition
  triggerTransition: (taskTitle: string) => void
  clearTransition: () => void

  // Data backup
  loadBackup: (data: BackupData) => void

  // Daily reset
  checkDailyReset: () => void
}

// ─── Backup ───────────────────────────────────────────────────────────────────

export interface BackupData {
  version: number
  exportedAt: string
  tasks: Task[]
  sessions: PomodoroSession[]
  settings: Settings
  pomodorosToday: number
  lastResetDate: string
}

export type AppStore = AppState & AppActions
