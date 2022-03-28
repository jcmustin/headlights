import { DateTime } from 'luxon'

import { Status } from './constants/status'
import { createSchedule, Schedule } from './models/Schedule'
import { Task } from './models/Task'

export type AppState = {
  schedule: Schedule
  activeDay: Date
  activeTask: Task | undefined
  startActiveTask: () => void
  completeActiveTask: (status?: Status) => void
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
    startActiveTask(): void {
      if (this.activeTask) {
        this.activeTask.startTime = DateTime.now()
      }
    },
    completeActiveTask(status: Status = Status.Successful): void {
      console.log(status)
      if (this.activeTask) {
        this.activeTask.endTime = DateTime.now()
        this.activeTask.status = status
      }
    },
    updateSchedule(rawSchedule: string) {
      schedule = createSchedule(rawSchedule)
    },
  }
}
