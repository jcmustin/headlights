import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import Task from './components/Task';
import Timer from './components/Timer';
import IpcMessages from './constants/ipcMessages';
import States from './constants/states';

export default function App() {
  const [activeTask, setActiveTask] = useState({ name: '', duration: 0 });
  useEffect(() => {
    ipcRenderer.on(IpcMessages.UpdateActiveTask, (_, task) => {
      setActiveTask(task);
    });
  }, []);

  return (
    <Router>
      <Switch>
        <Route path={States.Timer}>
          <Timer duration={activeTask.duration} name={activeTask.name} />
        </Route>
        <Route path={States.Task}>
          <Task />
        </Route>
      </Switch>
    </Router>
  );
}
