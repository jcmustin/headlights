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
  return {
    get schedule() {
      return schedule
    },
    activeDay,
    get activeTask(): Task | undefined {
      return schedule.getActiveTask()
    },
    completeActiveTask(status: Status = Status.Successful): void {
      if (this.activeTask) {
        this.activeTask.status = status
      }
    },
    updateSchedule(rawSchedule: string) {
      schedule = createSchedule(rawSchedule)
    },
  }
}
