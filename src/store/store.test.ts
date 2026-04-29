import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './store'

function resetStore() {
  useAppStore.setState({
    tasks: [],
    sessions: [],
    selectedTaskId: null,
    pomodorosToday: 0,
    lastResetDate: new Date().toLocaleDateString('sv-SE'),
    timer: {
      status: 'idle',
      remainingSeconds: 25 * 60,
      currentPomodoro: 0,
    },
    transition: null,
    settings: {
      workTime: 25,
      breakTime: 5,
      soundEnabled: false,
      darkMode: false,
      ambientSound: 'off',
    },
  })
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

describe('task actions', () => {
  beforeEach(resetStore)

  it('addTask creates a task with defaults', () => {
    useAppStore.getState().addTask({
      title: 'Test task',
      status: 'pending',
      estimatedPomodoros: 3,
      isQuickWin: true,
      tags: ['today'],
    })
    const { tasks } = useAppStore.getState()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Test task')
    expect(tasks[0].completedPomodoros).toBe(0)
    expect(tasks[0].tags).toEqual(['today'])
  })

  it('updateTask patches fields', () => {
    useAppStore.getState().addTask({ title: 'T', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['inbox'] })
    const id = useAppStore.getState().tasks[0].id
    useAppStore.getState().updateTask(id, { title: 'Updated' })
    expect(useAppStore.getState().tasks[0].title).toBe('Updated')
  })

  it('deleteTask removes task and clears selection', () => {
    useAppStore.getState().addTask({ title: 'T', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const id = useAppStore.getState().tasks[0].id
    useAppStore.setState({ selectedTaskId: id })
    useAppStore.getState().deleteTask(id)
    expect(useAppStore.getState().tasks).toHaveLength(0)
    expect(useAppStore.getState().selectedTaskId).toBeNull()
  })

  it('setTaskStatus enforces only one in-progress', () => {
    const { addTask, setTaskStatus } = useAppStore.getState()
    addTask({ title: 'A', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    addTask({ title: 'B', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const idA = useAppStore.getState().tasks[0].id
    const idB = useAppStore.getState().tasks[1].id

    setTaskStatus(idA, 'in-progress')
    setTaskStatus(idB, 'in-progress')

    const tasks = useAppStore.getState().tasks
    expect(tasks.find((t) => t.id === idA)?.status).toBe('pending')
    expect(tasks.find((t) => t.id === idB)?.status).toBe('in-progress')
  })

  it('selectTask sets in-progress and clears previous', () => {
    const { addTask, selectTask } = useAppStore.getState()
    addTask({ title: 'A', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    addTask({ title: 'B', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const idA = useAppStore.getState().tasks[0].id
    const idB = useAppStore.getState().tasks[1].id

    selectTask(idA)
    selectTask(idB)

    const tasks = useAppStore.getState().tasks
    expect(tasks.find((t) => t.id === idA)?.status).toBe('pending')
    expect(tasks.find((t) => t.id === idB)?.status).toBe('in-progress')
    expect(useAppStore.getState().selectedTaskId).toBe(idB)
  })

  it('selectTask(null) resets previous to pending', () => {
    const { addTask, selectTask } = useAppStore.getState()
    addTask({ title: 'A', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const idA = useAppStore.getState().tasks[0].id
    selectTask(idA)
    selectTask(null)
    expect(useAppStore.getState().tasks[0].status).toBe('pending')
    expect(useAppStore.getState().selectedTaskId).toBeNull()
  })
})

// ─── Subtasks ─────────────────────────────────────────────────────────────────

describe('subtask actions', () => {
  beforeEach(resetStore)

  it('addSubtask appends a subtask to a task', () => {
    useAppStore.getState().addTask({ title: 'T', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const taskId = useAppStore.getState().tasks[0].id
    useAppStore.getState().addSubtask(taskId, 'Buscar DNI')
    const subtasks = useAppStore.getState().tasks[0].subtasks
    expect(subtasks).toHaveLength(1)
    expect(subtasks[0].title).toBe('Buscar DNI')
    expect(subtasks[0].completed).toBe(false)
  })

  it('toggleSubtask flips completed flag', () => {
    useAppStore.getState().addTask({ title: 'T', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const taskId = useAppStore.getState().tasks[0].id
    useAppStore.getState().addSubtask(taskId, 'Step 1')
    const subtaskId = useAppStore.getState().tasks[0].subtasks[0].id
    useAppStore.getState().toggleSubtask(taskId, subtaskId)
    expect(useAppStore.getState().tasks[0].subtasks[0].completed).toBe(true)
    useAppStore.getState().toggleSubtask(taskId, subtaskId)
    expect(useAppStore.getState().tasks[0].subtasks[0].completed).toBe(false)
  })

  it('deleteSubtask removes the subtask', () => {
    useAppStore.getState().addTask({ title: 'T', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    const taskId = useAppStore.getState().tasks[0].id
    useAppStore.getState().addSubtask(taskId, 'Step 1')
    useAppStore.getState().addSubtask(taskId, 'Step 2')
    const subtaskId = useAppStore.getState().tasks[0].subtasks[0].id
    useAppStore.getState().deleteSubtask(taskId, subtaskId)
    expect(useAppStore.getState().tasks[0].subtasks).toHaveLength(1)
    expect(useAppStore.getState().tasks[0].subtasks[0].title).toBe('Step 2')
  })
})

// ─── Timer ──────────────────────────────────────────────────────────────────

describe('timer actions', () => {
  beforeEach(resetStore)

  it('startTimer transitions idle → work_running', () => {
    useAppStore.getState().startTimer()
    expect(useAppStore.getState().timer.status).toBe('work_running')
  })

  it('pauseTimer transitions work_running → work_paused', () => {
    useAppStore.getState().startTimer()
    useAppStore.getState().pauseTimer()
    expect(useAppStore.getState().timer.status).toBe('work_paused')
  })

  it('resetTimer returns to idle and resets pomodoro count', () => {
    useAppStore.setState((s) => ({ timer: { ...s.timer, currentPomodoro: 2 } }))
    useAppStore.getState().resetTimer()
    const timer = useAppStore.getState().timer
    expect(timer.status).toBe('idle')
    expect(timer.currentPomodoro).toBe(0)
    expect(timer.remainingSeconds).toBe(25 * 60)
  })

  it('_syncTimerSeconds updates remainingSeconds', () => {
    useAppStore.getState()._syncTimerSeconds(120)
    expect(useAppStore.getState().timer.remainingSeconds).toBe(120)
  })

  it('_completePomodoro from work_running → break_ready', () => {
    useAppStore.getState().addTask({
      title: 'Work',
      status: 'in-progress',
      estimatedPomodoros: 4,
      isQuickWin: false,
      tags: ['today'],
    })
    const taskId = useAppStore.getState().tasks[0].id
    useAppStore.setState({ selectedTaskId: taskId })
    useAppStore.setState((s) => ({ timer: { ...s.timer, status: 'work_running' as const } }))

    useAppStore.getState()._completePomodoro()

    const state = useAppStore.getState()
    expect(state.timer.status).toBe('break_ready')
    expect(state.timer.currentPomodoro).toBe(1)
    expect(state.pomodorosToday).toBe(1)
    expect(state.tasks[0].completedPomodoros).toBe(1)
    expect(state.sessions).toHaveLength(1)
  })

  it('_completePomodoro from break_running → work_ready', () => {
    useAppStore.setState((s) => ({ timer: { ...s.timer, status: 'break_running' as const, remainingSeconds: 60 } }))
    useAppStore.getState()._completePomodoro()
    expect(useAppStore.getState().timer.status).toBe('work_ready')
    expect(useAppStore.getState().timer.remainingSeconds).toBe(25 * 60)
  })

  it('skipBreak transitions break → work_ready', () => {
    useAppStore.setState((s) => ({ timer: { ...s.timer, status: 'break_running' as const } }))
    useAppStore.getState().skipBreak()
    expect(useAppStore.getState().timer.status).toBe('work_ready')
  })

  it('skipBreak does nothing from work', () => {
    useAppStore.setState((s) => ({ timer: { ...s.timer, status: 'work_running' as const } }))
    useAppStore.getState().skipBreak()
    expect(useAppStore.getState().timer.status).toBe('work_running')
  })

  it('startQuickSession sets work_running with given minutes without mutating settings', () => {
    useAppStore.getState().startQuickSession(5)
    const state = useAppStore.getState()
    expect(state.timer.status).toBe('work_running')
    expect(state.timer.remainingSeconds).toBe(5 * 60)
    expect(state.settings.workTime).toBe(25) // unchanged
  })

  it('setTimerDuration updates workTime and remaining when idle', () => {
    useAppStore.getState().setTimerDuration(50)
    const state = useAppStore.getState()
    expect(state.settings.workTime).toBe(50)
    expect(state.timer.remainingSeconds).toBe(50 * 60)
  })

  it('setTimerDuration does nothing when running', () => {
    useAppStore.setState((s) => ({ timer: { ...s.timer, status: 'work_running' as const } }))
    useAppStore.getState().setTimerDuration(15)
    expect(useAppStore.getState().settings.workTime).toBe(25)
  })

  it('sessions are capped at 500', () => {
    const fakeSessions = Array.from({ length: 500 }, (_, i) => ({
      taskId: 'old',
      duration: 25,
      completedAt: `2020-01-${String((i % 30) + 1).padStart(2, '0')}T10:00:00.000Z`,
    }))
    useAppStore.setState({ sessions: fakeSessions })
    useAppStore.setState((s) => ({ timer: { ...s.timer, status: 'work_running' as const } }))
    useAppStore.getState()._completePomodoro()
    expect(useAppStore.getState().sessions).toHaveLength(500)
  })
})

// ─── Daily Reset ────────────────────────────────────────────────────────────

describe('checkDailyReset', () => {
  beforeEach(resetStore)

  it('resets pomodorosToday on new day', () => {
    useAppStore.setState({ pomodorosToday: 5, lastResetDate: '2020-01-01' })
    useAppStore.getState().checkDailyReset()
    expect(useAppStore.getState().pomodorosToday).toBe(0)
  })

  it('does nothing on same day', () => {
    const today = new Date().toLocaleDateString('sv-SE')
    useAppStore.setState({ pomodorosToday: 5, lastResetDate: today })
    useAppStore.getState().checkDailyReset()
    expect(useAppStore.getState().pomodorosToday).toBe(5)
  })
})

// ─── Backup ─────────────────────────────────────────────────────────────────

describe('loadBackup', () => {
  beforeEach(resetStore)

  it('loads backup data and resets transient state', () => {
    useAppStore.getState().addTask({ title: 'Old', status: 'pending', estimatedPomodoros: 1, isQuickWin: false, tags: ['today'] })
    useAppStore.setState({ selectedTaskId: 'some-id', pomodorosToday: 3 })

    useAppStore.getState().loadBackup({
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: [{ id: 'new', title: 'New', status: 'pending', createdAt: new Date().toISOString(), lastWorkedAt: null, estimatedPomodoros: 2, completedPomodoros: 0, isQuickWin: true, tags: ['inbox'], subtasks: [] }],
      sessions: [],
      settings: { workTime: 15, breakTime: 3, soundEnabled: false, darkMode: true, ambientSound: 'off' },
      pomodorosToday: 0,
      lastResetDate: new Date().toLocaleDateString('sv-SE'),
    })

    const state = useAppStore.getState()
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0].title).toBe('New')
    expect(state.selectedTaskId).toBeNull()
    expect(state.settings.workTime).toBe(15)
    expect(state.settings.darkMode).toBe(true)
    expect(state.timer.status).toBe('idle')
  })
})
