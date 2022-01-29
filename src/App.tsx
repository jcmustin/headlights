import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.global.css'
import ScheduleView from './components/Schedule'
import TaskView from './components/Task'
import TimerView from './components/Timer'
import IpcMessages from './constants/ipcMessages'
import States from './constants/states'
import Task from './types/Task'

export default function App() {
  const [activeTask, setActiveTask] = useState({ name: '', duration: 0 })
  const [schedule, setSchedule] = useState('')
  useEffect(() => {
    ipcRenderer.on(IpcMessages.UpdateActiveTask, (_, task: Task) => {
      setActiveTask(task)
    })
  }, [])

  return (
    <Router>
      <Switch>
        <Route path={States.Timer}>
          <TimerView duration={activeTask.duration} name={activeTask.name} />
        </Route>
        <Route path={States.Task}>
          <TaskView />
        </Route>
        <Route path={States.Schedule}>
          <ScheduleView schedule={schedule} setSchedule={setSchedule} />
        </Route>
      </Switch>
    </Router>
  )
}
