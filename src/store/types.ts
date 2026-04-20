export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string       // ISO 8601
  lastWorkedAt: string | null  // ISO 8601
  estimatedPomodoros: number
  completedPomodoros: number
  isQuickWin: boolean
  subtasks: Subtask[]
  source: 'inbox' | 'today'
}

export interface PomodoroSession {
  taskId: string
  duration: number    // minutos
  completedAt: string // ISO 8601
}

export interface TimerState {
  isRunning: boolean
  mode: 'work' | 'break'
  remainingSeconds: number
  currentPomodoro: number
}

export interface Settings {
  workTime: number   // minutos
  breakTime: number  // minutos
  soundEnabled: boolean
  darkMode: boolean
  ambientSound: 'off' | 'brown' | 'white'
}

export interface Transition {
  taskTitle: string
}

export interface AppState {
  tasks: Task[]
  sessions: PomodoroSession[]
  selectedTaskId: string | null
  pomodorosToday: number
  lastResetDate: string  // ISO 8601 — fecha del último reset
  timer: TimerState
  settings: Settings
  transition: Transition | null  // pantalla intermedia post-enfoque (no persistida)
}

export interface AppActions {
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'lastWorkedAt' | 'completedPomodoros' | 'subtasks'>) => void
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (id: string) => void
  setTaskStatus: (id: string, status: Task['status']) => void
  selectTask: (id: string | null) => void
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void

  // Timer
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipToBreak: () => void
  tick: () => void
  setTimerMode: (mode: TimerState['mode']) => void
  setTimerDuration: (minutes: number) => void

  // Sessions
  completePomodoro: () => void
  syncTimerSeconds: (remainingSeconds: number) => void

  // Settings
  updateSettings: (patch: Partial<Settings>) => void

  // Transition (post-focus completion)
  triggerTransition: (taskTitle: string) => void
  clearTransition: () => void

  // Data backup
  loadBackup: (data: BackupData) => void

  // Daily reset
  checkDailyReset: () => void
}

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
