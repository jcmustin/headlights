import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Task from './components/Task';
import Timer from './components/Timer';
import './App.global.css';
import States from './constants/states';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path={States.Task}>
          <Task />
        </Route>
        <Route path={States.Timer}>
          <Timer duration={0.1} taskTitle="Headlights" />
        </Route>
      </Switch>
    </Router>
  );
}
