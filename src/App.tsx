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
  }, [])

  switch (currentView) {
    case View.Task:
    default:
      return <TaskView duration={activeTask.duration} name={activeTask.name} />
    case View.Timer:
      return <TimerView duration={activeTask.duration} name={activeTask.name} />
    case View.Schedule:
      return <ScheduleView schedule={schedule} />
  }
}
