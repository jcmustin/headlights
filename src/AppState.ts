import { createSchedule, Schedule } from './models/Schedule'
import { Task } from './models/Task'

export type AppState = {
  schedule: Schedule
  activeDay: Date
  activeTask: Task | undefined
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
    updateSchedule(rawSchedule: string) {
      console.log('rawSchedule', rawSchedule)
      schedule = createSchedule(rawSchedule)
    },
  }
}
