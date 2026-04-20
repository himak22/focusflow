import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { Task } from '@/store'

type Source = Task['source']

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Quick wins primero
    if (a.isQuickWin !== b.isQuickWin) return a.isQuickWin ? -1 : 1
    // Luego por fecha de creación ascendente
    return a.createdAt.localeCompare(b.createdAt)
  })
}

export function useSortedTasks(source: Source) {
  const tasks = useAppStore((s) => s.tasks)

  return useMemo(() => {
    const filtered = tasks.filter((t) => t.source === source && t.status !== 'completed')
    return sortTasks(filtered)
  }, [tasks, source])
}

export function useCompletedTasks(source: Source) {
  const tasks = useAppStore((s) => s.tasks)

  return useMemo(
    () => tasks.filter((t) => t.source === source && t.status === 'completed'),
    [tasks, source]
  )
}
