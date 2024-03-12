import { DateTime } from 'luxon'

import { Status } from './constants/status'
import View from './constants/view'
import { createSchedule, Schedule } from './models/Schedule'
import { Task } from './models/Task'

export type AppState = {
  view: View
  isScheduleOpen: boolean
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
    get isScheduleOpen() {
      return scheduleActive
    },
    set isScheduleOpen(newScheduleActive: boolean) {
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
      /**
       * cachedActiveTask is the active task (i.e. the first task-like line in the schedule raw text
       * which isn't complete) from the previous time we called this.updateActiveTask(). Unless something's
       * amiss, it should be the one used to populate the timer view.
       */
      const { activeTask: cachedActiveTask } = this
      this.updateActiveTask()
      const { activeTask: currentActiveTask } = this
      /**
       * if cachedActiveTask is undefined, it's not clear what we should update, so we exit.
       */
      if (!cachedActiveTask) {
        console.error('no cached active task to update on task completion.')
        return
      }
      /**
       * if the cached active task isn't the current active task,
       * (i.e. bc the user has modified the schedule mid-task,)
       * make no guesses about what we should modify.
       * Instead, insert a new entry for the cached active task
       * before the current active task. can result in duplicates,
       * but it doesn't destroy data.
       */
      else if (!currentActiveTask?.is(cachedActiveTask)) {
        schedule.insertBeforeActive(cachedActiveTask)
        cachedActiveTask.endTime = DateTime.now()
        if (cachedActiveTask.startTime) {
          cachedActiveTask.duration = Math.round(cachedActiveTask.endTime.diff(cachedActiveTask.startTime, 'minutes').minutes)
        }
        cachedActiveTask.status = status
      }
      else {
        currentActiveTask.endTime = DateTime.now()
        if (currentActiveTask.startTime) {
          currentActiveTask.duration = Math.round(currentActiveTask.endTime.diff(currentActiveTask.startTime, 'minutes').minutes)
        }
        currentActiveTask.status = status
      }
      this.updateActiveTask()
    },
    updateSchedule(rawSchedule: string) {
      schedule = createSchedule(rawSchedule)
    },
  }
}
