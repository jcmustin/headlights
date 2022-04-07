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
  const [scheduleOpen, setScheduleActive] = useState(true)
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
      channel: IpcMessage.SetScheduleActive,
      callback: (_, isActive) => {
        setScheduleActive(isActive)
      },
    })
  }, [])

  return (
    <>
      {currentView === View.Task && !scheduleOpen && (
        <TaskView duration={activeTask.duration} name={activeTask.name} />
      )}
      {scheduleOpen && <ScheduleView schedule={schedule} />}
      {currentView === View.Timer && (
        <TimerView duration={activeTask.duration} name={activeTask.name} />
      )}
    </>
  )
}
