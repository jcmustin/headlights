import { Status } from '../constants/status'
import { createEntry, Entry, isTaskEntry } from './Entry'
import { Task } from './Task'

export type Schedule = Entry[] & {
  getActiveTask: () => Task | undefined
  insertBeforeActive: (task: Task) => void
  enqueue: (task: Task) => void
  toString: () => string
}

export function createSchedule(rawSchedule?: string): Schedule {
  const entries =
    rawSchedule && rawSchedule.length
      ? rawSchedule.split('\n').map((entry) => createEntry(entry))
      : []
  const getActiveTask = (): Task | undefined => {
    return entries.find(
      (entry): entry is Task => isTaskEntry(entry) && !entry.isComplete(),
    )
  }
  return Object.assign(entries, {
    getActiveTask,
    remove(task: Task) {
      entries.splice(entries.indexOf(task), 1)
    },
    updateStatus(task: Task, status: Status) {
      const taskEntry = entries.find((entry) => task.is(entry)) as
        | Task
        | undefined
      if (!taskEntry) return
      taskEntry.status = status
    },
    insertBeforeActive(task: Task) {
      const activeTask = getActiveTask()
      console.log('compare:', activeTask, task)
      if (activeTask && !task.is(activeTask)) {
        entries.splice(entries.indexOf(activeTask), 0, task)
      }
    },
    enqueue(task: Task) {
      entries.push(task)
    },
    toString: () => entries.map((entry) => entry.toString()).join('\n'),
  })
}
