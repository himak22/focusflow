import { useAppStore } from '@/store'

export function ActiveTask() {
  const tasks = useAppStore((s) => s.tasks)
  const selectedTaskId = useAppStore((s) => s.selectedTaskId)
  const setTimerDuration = useAppStore((s) => s.setTimerDuration)
  const startTimer = useAppStore((s) => s.startTimer)
  const selectTask = useAppStore((s) => s.selectTask)

  const activeTask = tasks.find((t) => t.id === selectedTaskId) ?? null

  function handleFiveMin() {
    setTimerDuration(5)
    startTimer()
  }

  if (!activeTask) {
    return (
      <section className="px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Seleccioná una tarea para entrar en modo enfoque
        </p>
      </section>
    )
  }

  return (
    <section className="px-4 py-6 border-b border-border bg-primary/5">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Modo enfoque
          </p>
          <h2 className="text-lg font-semibold text-foreground truncate">
            {activeTask.title}
          </h2>
          {activeTask.isQuickWin && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              ⚡ Quick win
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleFiveMin}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
          >
            Solo 5 min
          </button>
          <button
            onClick={() => selectTask(null)}
            title="Salir del modo enfoque"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </section>
  )
}
