import { Status } from './constants/status'
import { createSchedule, Schedule } from './models/Schedule'
import { Task } from './models/Task'

export type AppState = {
  schedule: Schedule
  activeDay: Date
  activeTask: Task | undefined
  completeActiveTask: () => void
  updateSchedule(rawSchedule: string): void
}

export const createAppState = (rawSchedule?: string): AppState => {
  let schedule = createSchedule(rawSchedule ? rawSchedule : '')
  let activeDay = new Date()
  let activeTask = schedule.getActiveTask()
  return {
    get schedule() {
      return schedule
    },
    activeDay,
    get activeTask(): Task | undefined {
      return activeTask
    },
    set activeTask(task: Task | undefined) {
      activeTask = task
    },
    completeActiveTask(status: Status = Status.Successful): void {
      if (activeTask) {
        activeTask.status = status
      }
      activeTask = schedule.getActiveTask()
    },
    updateSchedule(rawSchedule: string) {
      schedule = createSchedule(rawSchedule)
      activeTask = schedule.getActiveTask()
    },
  }
}
