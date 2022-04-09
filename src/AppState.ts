import { DateTime } from 'luxon'

import { Status } from './constants/status'
import View from './constants/view'
import { createSchedule, Schedule } from './models/Schedule'
import { createTask, Task } from './models/Task'

export type AppState = {
  view: View
  scheduleActive: boolean
  schedule: Schedule
  activeDay: Date
  activeTask: Task | undefined
  startActiveTask: () => void
  completeActiveTask: (status?: Status) => void
  updateActiveTask: () => void
  updateSchedule: (rawSchedule: string) => void
}

export const createAppState = (rawSchedule?: string): AppState => {
  let schedule = createSchedule(rawSchedule ? rawSchedule : '')
  let activeDay = new Date()
  let view = View.Task
  let scheduleActive = true
  let activeTask = schedule.getActiveTask()
  return {
    get view() {
      return view
    },
    set view(newView: View) {
      view = newView
    },
    get scheduleActive() {
      return scheduleActive
    },
    set scheduleActive(newScheduleActive: boolean) {
      scheduleActive = newScheduleActive
    },
    get schedule() {
      return schedule
    },
    activeDay,
    get activeTask(): Task | undefined {
      return activeTask
    },
    startActiveTask(): void {
      if (this.activeTask) {
        this.activeTask.startTime = DateTime.now()
      }
    },
    updateActiveTask(): void {
      activeTask = schedule.getActiveTask()
    },
    completeActiveTask(status: Status = Status.Successful): void {
      const { activeTask: cachedActiveTask } = this
      this.updateActiveTask()
      const { activeTask: currentActiveTask } = this
      console.log(cachedActiveTask, currentActiveTask)
      if (!cachedActiveTask) return
      if (!currentActiveTask?.is(cachedActiveTask)) {
        console.log('!==')
        schedule.insertBeforeActive(cachedActiveTask)
        cachedActiveTask.endTime = DateTime.now()
        cachedActiveTask.status = status
      } else {
        currentActiveTask.endTime = DateTime.now()
        currentActiveTask.status = status
      }
      this.updateActiveTask()
    },
    updateSchedule(rawSchedule: string) {
      schedule = createSchedule(rawSchedule)
    },
  }
}
