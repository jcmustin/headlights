import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import './App.global.css'
import ScheduleView from './components/Schedule'
import TaskView from './components/Task'
import TimerView from './components/Timer'
import IpcMessages from './constants/ipcMessages'
import { isStatus, Status } from './constants/status'
import View from './constants/view'
import { createTask, Task, TaskData } from './models/Task'

export default function App() {
  const [activeTask, setActiveTask] = useState<Task>(createTask())
  const [schedule, setSchedule] = useState('')
  const [currentView, setCurrentView] = useState<View>(View.Task)
  useEffect(() => {
    ipcRenderer.on(IpcMessages.SetActiveTask, (_, taskData: TaskData) => {
      setActiveTask(createTask(taskData))
      console.log('x' in Status)
    })
    ipcRenderer.on(IpcMessages.SetSchedule, (_, rawSchedule: string) => {
      setSchedule(rawSchedule)
    })
    ipcRenderer.on(IpcMessages.SetView, (_, view: View) => {
      setCurrentView(view)
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
