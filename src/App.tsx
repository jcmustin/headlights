import React, { useEffect, useState } from 'react'
import ScheduleView from './components/Schedule'
import TaskView from './components/Task'
import TimerView from './components/Timer'
import IpcMessage from './constants/ipcMessage'
import View from './constants/view'
import { createTask, Task, TaskData } from './models/Task'
import { createIpcRendererInterface } from './utils/IpcInterface'

export default function App() {
  const [activeTask, setActiveTask] = useState<Task>(createTask())
  const [schedule, setSchedule] = useState('')
  const [currentView, setCurrentView] = useState<View>(View.Task)
  const [scheduleOpen, setScheduleOpen] = useState(true)
  const [hasHydrated, setHasHydrated] = useState(false)
  const ipcRenderer = createIpcRendererInterface()
  useEffect(() => {
    ipcRenderer.on({
      channel: IpcMessage.SetActiveTask,
      callback: (_, taskData: TaskData) => {
        setActiveTask(createTask(taskData))
      },
    })
    ipcRenderer.on({
      channel: IpcMessage.SetSchedule,
      callback: (_, rawSchedule: string) => {
        setSchedule(rawSchedule)
      },
    })
    ipcRenderer.on({
      channel: IpcMessage.SetView,
      callback: (_, view: View) => {
        setCurrentView(view)
      },
    })
    ipcRenderer.on({
      channel: IpcMessage.SetScheduleOpen,
      callback: (_, isScheduleOpen) => {
        setScheduleOpen(isScheduleOpen)
      },
    })
    ipcRenderer.on({
      channel: IpcMessage.Hydrate,
      callback: (_, { activeTaskData, rawSchedule, view, isScheduleOpen }) => {
        if (!hasHydrated) {
          setHasHydrated(true)
          setActiveTask(createTask(activeTaskData))
          setSchedule(rawSchedule)
          setCurrentView(view)
          setScheduleOpen(isScheduleOpen)
        }
      },
    })
  }, [])

  if (!hasHydrated) {
    ipcRenderer.send({ channel: IpcMessage.CueHydrate })
  }

  return (
    <>
      {currentView === View.Task && !scheduleOpen && (
        <TaskView duration={activeTask.duration} name={activeTask.name} />
      )}
      {scheduleOpen && <ScheduleView schedule={schedule} />}
      {currentView === View.Timer && (
        <TimerView durationInMinutes={activeTask.duration} name={activeTask.name} />
      )}
    </>
  )
}
