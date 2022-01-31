import { ipcRenderer } from 'electron/renderer'
import React from 'react'
import { render } from 'react-dom'
import App from './App'
import IpcMessages from './constants/ipcMessages'

try {
  render(<App />, document.getElementById('root'))
} catch (e) {}
