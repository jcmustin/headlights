// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { createIpcRendererInterface } from './IpcRendererInterface'

export type Channels = 'ipc-example'

const ipcRendererInterface = createIpcRendererInterface()
const electronHandler = {
  send: ipcRendererInterface.send,
  on: ipcRendererInterface.on,
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
