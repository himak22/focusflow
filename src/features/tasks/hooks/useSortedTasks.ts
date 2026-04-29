import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { Task } from '@/store'

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Quick wins primero
    if (a.isQuickWin !== b.isQuickWin) return a.isQuickWin ? -1 : 1
    // Luego por fecha de creación ascendente
    return a.createdAt.localeCompare(b.createdAt)
  })
}

export function useSortedTasks(tag: string) {
  const tasks = useAppStore((s) => s.tasks)

  return useMemo(() => {
    const filtered = tasks.filter((t) => t.tags.includes(tag) && t.status !== 'completed')
    return sortTasks(filtered)
  }, [tasks, tag])
}

export function useCompletedTasks(tag: string) {
  const tasks = useAppStore((s) => s.tasks)

  return useMemo(
    () => tasks.filter((t) => t.tags.includes(tag) && t.status === 'completed'),
    [tasks, tag]
  )
}
