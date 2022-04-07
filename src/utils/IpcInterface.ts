import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron'
import IpcMessage from '../constants/ipcMessage'
import { Status } from '../constants/status'
import View from '../constants/view'
import { TaskData } from '../models/Task'

type IpcParams =
  | { channel: IpcMessage.StartTask; param: TaskData }
  | { channel: IpcMessage.EndTask; param?: TaskData }
  | { channel: IpcMessage.SetActiveTask; param: TaskData | undefined }
  | { channel: IpcMessage.CueSetSchedule; param: string }
  | { channel: IpcMessage.SetSchedule; param: string }
  | { channel: IpcMessage.SaveSchedule; param: string }
  | { channel: IpcMessage.CueSetView; param: View }
  | { channel: IpcMessage.SetView; param: View }
  | { channel: IpcMessage.CueSetScheduleActive }
  | { channel: IpcMessage.SetScheduleActive; param: boolean }

type IpcCallback =
  | {
      channel: IpcMessage.StartTask
      callback: (
        event: IpcMainEvent | IpcRendererEvent,
        param: TaskData,
      ) => void
    }
  | {
      channel: IpcMessage.EndTask
      callback: (
        event: IpcMainEvent | IpcRendererEvent,
        param: TaskData,
      ) => void
    }
  | {
      channel: IpcMessage.SetActiveTask
      callback: (
        event: IpcMainEvent | IpcRendererEvent,
        param: TaskData,
      ) => void
    }
  | {
      channel: IpcMessage.CueSetSchedule
      callback: (event: IpcMainEvent | IpcRendererEvent, param: string) => void
    }
  | {
      channel: IpcMessage.SetSchedule
      callback: (event: IpcMainEvent | IpcRendererEvent, param: string) => void
    }
  | {
      channel: IpcMessage.SaveSchedule
      callback: (event: IpcMainEvent | IpcRendererEvent, param: string) => void
    }
  | {
      channel: IpcMessage.CueSetView
      callback: (event: IpcMainEvent | IpcRendererEvent, param: View) => void
    }
  | {
      channel: IpcMessage.SetView
      callback: (event: IpcMainEvent | IpcRendererEvent, param: View) => void
    }
  | {
      channel: IpcMessage.CueSetScheduleActive
      callback: (event: IpcMainEvent | IpcRendererEvent) => void
    }
  | {
      channel: IpcMessage.SetScheduleActive
      callback: (event: IpcMainEvent | IpcRendererEvent, param: boolean) => void
    }
export type IpcMainInterface = {
  on: (params: IpcCallback) => void
  emit: (params: IpcParams) => void
  send: (params: IpcParams) => void
}

export type IpcRendererInterface = {
  send: (params: IpcParams) => void
  on: (params: IpcCallback) => void
}

export const createIpcMainInterface = (windows: {
  [key: number]: BrowserWindow
}): IpcMainInterface => {
  return {
    on: (params: IpcCallback): void => {
      ipcMain.on(params.channel, params.callback)
    },
    emit: (params: IpcParams) => {
      'param' in params
        ? ipcMain.emit(params.channel, params.param)
        : ipcMain.emit(params.channel)
    },
    send: (params: IpcParams) => {
      Object.values(windows).forEach((window) => {
        'param' in params
          ? window.webContents.send(params.channel, params.param)
          : window.webContents.send(params.channel)
      })
    },
  }
}

export const createIpcRendererInterface = (): IpcRendererInterface => ({
  send: (params: IpcParams) => {
    'param' in params
      ? ipcRenderer.send(params.channel, params.param)
      : ipcRenderer.send(params.channel)
  },
  on: (params: IpcCallback): void => {
    ipcRenderer.on(params.channel, params.callback)
  },
})
