import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
} from 'electron'
import IpcMessage from '../constants/ipcMessage'
import View from '../constants/view'
import { TaskData } from '../models/Task'

type IpcParams =
  | { channel: IpcMessage.StartTask; param: TaskData }
  | { channel: IpcMessage.EndTask; param?: TaskData }
  | { channel: IpcMessage.SetActiveTask; param?: TaskData }
  | { channel: IpcMessage.CueSetSchedule; param: string }
  | { channel: IpcMessage.SetSchedule; param: string }
  | { channel: IpcMessage.SaveSchedule; param: string }
  | { channel: IpcMessage.CueSetView; param: View }
  | { channel: IpcMessage.SetView; param: View }
  | { channel: IpcMessage.CueSetScheduleOpen }
  | { channel: IpcMessage.SetScheduleOpen; param: boolean }
  | { channel: IpcMessage.CueHydrate }
  | {
    channel: IpcMessage.Hydrate
    param: {
      activeTaskData?: TaskData
      rawSchedule: string
      view: View
      isScheduleOpen: boolean
    }
  }

type IpcCallback =
  | {
    channel: IpcMessage.StartTask
    callback: (
      event: IpcMainEvent,
      param: TaskData,
    ) => void
  }
  | {
    channel: IpcMessage.EndTask
    callback: (
      event: IpcMainEvent,
      param: TaskData,
    ) => void
  }
  | {
    channel: IpcMessage.SetActiveTask
    callback: (
      event: IpcMainEvent,
      param: TaskData,
    ) => void
  }
  | {
    channel: IpcMessage.CueSetSchedule
    callback: (event: IpcMainEvent, param: string) => void
  }
  | {
    channel: IpcMessage.SetSchedule
    callback: (event: IpcMainEvent, param: string) => void
  }
  | {
    channel: IpcMessage.SaveSchedule
    callback: (event: IpcMainEvent, param: string) => void
  }
  | {
    channel: IpcMessage.CueSetView
    callback: (event: IpcMainEvent, param: View) => void
  }
  | {
    channel: IpcMessage.SetView
    callback: (event: IpcMainEvent, param: View) => void
  }
  | {
    channel: IpcMessage.CueSetScheduleOpen
    callback: (event: IpcMainEvent) => void
  }
  | {
    channel: IpcMessage.SetScheduleOpen
    callback: (event: IpcMainEvent, param: boolean) => void
  }
  | {
    channel: IpcMessage.CueHydrate
    callback: (event: IpcMainEvent) => void
  }
  | {
    channel: IpcMessage.Hydrate
    callback: (
      event: IpcMainEvent,
      param: {
        activeTaskData?: TaskData
        rawSchedule: string
        view: View
        isScheduleOpen: boolean
      },
    ) => void
  }

export type IpcMainInterface = {
  on: (params: IpcCallback) => void
  emit: (params: IpcParams) => void
  send: (params: IpcParams) => void
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
