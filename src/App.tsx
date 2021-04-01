import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Timer from './components/Timer';
import './App.global.css';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route
          path="/"
          component={() => <Timer duration={0.1} taskTitle="Headlights" />}
        />
      </Switch>
    </Router>
  );
}
