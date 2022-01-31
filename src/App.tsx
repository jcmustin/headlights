import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import './App.global.css'
import ScheduleView from './components/Schedule'
import TaskView from './components/Task'
import TimerView from './components/Timer'
import IpcMessages from './constants/ipcMessages'
import View from './constants/view'
import Task from './types/Task'

export default function App() {
  const [activeTask, setActiveTask] = useState<Task>({ name: '', duration: 0 })
  const [schedule, setSchedule] = useState('')
  const [currentView, setCurrentView] = useState<View>(View.Task)
  useEffect(() => {
    ipcRenderer.on(IpcMessages.SetActiveTask, (_, task: Task) => {
      setActiveTask(task)
    })
    ipcRenderer.on(IpcMessages.SetSchedule, (_, schedule: string) => {
      setSchedule(schedule)
    })
    ipcRenderer.on(IpcMessages.SetView, (_, view: View) => {
      if (currentView !== view) {
        setCurrentView(view)
      }
    })
  }, [])

  switch (currentView) {
    case View.Task:
    default:
      return <TaskView />
      break
    case View.Timer:
      return <TimerView duration={activeTask.duration} name={activeTask.name} />
      break
    case View.Schedule:
      return <ScheduleView schedule={schedule} setSchedule={setSchedule} />
      break
  }
}
