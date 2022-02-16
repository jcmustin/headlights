/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import path from 'path'
import {
  app,
  BrowserWindow,
  Display,
  globalShortcut,
  Menu,
  screen,
  shell,
  Tray,
} from 'electron'
import { refresh } from 'electron-debug'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'

import MenuBuilder from './menu'
import IpcMessage from './constants/ipcMessage'
import View from './constants/view'
import { createTask, TaskData } from './models/Task'
import { createAppState } from './AppState'
import { createIpcMainInterface } from './utils/IpcInterface'

const DATA_FILE_PATH = `../log/${new Date().toISOString().slice(0, 10)}.txt`

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

const windows: { [key: number]: BrowserWindow } = {}

const setView = async (view: View) => {
  Object.values(windows).map((window) => {
    window.setIgnoreMouseEvents(view === View.Timer)
    window.webContents.send(IpcMessage.SetView, view)
  })
}

// let rawSchedule: string = fs.existsSync(DATA_FILE_PATH)
//   ? fs.readFileSync(DATA_FILE_PATH).toString()
//   : ''

const ipcMain = createIpcMainInterface(windows)

const appState = createAppState()

ipcMain.on({
  channel: IpcMessage.CueSetView,
  callback: (_, view: View) => {
    setView(view)
  },
})

ipcMain.on({
  channel: IpcMessage.StartTask,
  callback: (_, taskData: TaskData) => {
    appState.schedule.insertBeforeActive(createTask(taskData))
    ipcMain.send({ channel: IpcMessage.SetActiveTask, param: taskData })
    setView(View.Timer)
  },
})

ipcMain.on({
  channel: IpcMessage.EndTask,
  callback: () => {
    const { activeTask } = appState
    if (activeTask) {
      appState.completeActiveTask()
      const { activeTask: newActiveTask } = appState
      ipcMain.send({
        channel: IpcMessage.SetActiveTask,
        param: newActiveTask?.serialize(),
      })
      ipcMain.send({
        channel: IpcMessage.SetSchedule,
        param: appState.schedule.toString(),
      })
    }
    setView(View.Task)
  },
})

ipcMain.on({
  channel: IpcMessage.CueSetSchedule,
  callback: (_, rawSchedule: string) => {
    ipcMain.send({ channel: IpcMessage.SetSchedule, param: rawSchedule })
  },
})

ipcMain.on({
  channel: IpcMessage.SaveSchedule,
  callback: async (_, rawSchedule: string) => {
    appState.updateSchedule(rawSchedule)
    const { activeTask } = appState
    if (activeTask) {
      ipcMain.send({
        channel: IpcMessage.SetActiveTask,
        param: activeTask.serialize(),
      })
    }
    setView(View.Task)
  },
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  // require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log)
}

const createWindow: (display: Display) => BrowserWindow = (display) => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  let window: BrowserWindow | null = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    show: false,
    enableLargerThanScreen: true,
    minimizable: false,
    movable: false,
    transparent: true,
    frame: false,
    roundedCorners: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  window.setAlwaysOnTop(true, 'screen-saver')
  window.setSkipTaskbar(true)

  window.setResizable(true)
  window.setSize(display.size.width, display.size.height)
  window.setResizable(false)

  window.loadURL(`file://${__dirname}/index.html`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  window.webContents.on('did-finish-load', () => {
    if (!window) {
      throw new Error('"window" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      window.minimize()
    } else {
      window.show()
      window.focus()
    }
  })

  window.on('closed', () => {
    window = null
  })

  const menuBuilder = new MenuBuilder(window)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {
      action: 'deny',
    }
  })

  return window
}

const createWindows = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  screen.getAllDisplays().forEach((display) => {
    console.log(display.id)
    windows[display.id] = createWindow(display)
  })

  screen.on('display-added', (_, newDisplay) => {
    windows[newDisplay.id] = createWindow(newDisplay)
  })

  screen.on('display-removed', (_, oldDisplay) => {
    windows[oldDisplay.id].close()
    delete windows[oldDisplay.id]
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */

app.once('window-all-closed', () => {
  app.quit()
})

app.once('window-all-closed', app.quit)
app.once('before-quit', () => {
  // if (!fs.existsSync(DATA_FILE_PATH)) {
  //   fs.writeFileSync(DATA_FILE_PATH, `${appState.schedule}\n`)
  // }
  // fs.appendFileSync(DATA_FILE_PATH, `${appState.schedule}\n`)
  Object.entries(windows).forEach(([_, window]) => {
    window.removeAllListeners()
    window.close()
  })
})

let tray

const createTray = () => {
  const iconPath = path.join(__dirname, '../assets/icons/16x16.png')
  tray = new Tray(iconPath)
  const menu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click() {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(menu)
}

const registerShortcuts = () => {
  const shortcuts: { command: Electron.Accelerator; action: () => void }[] = [
    {
      command: 'CommandOrControl+Alt+Q',
      action: () => {
        app.exit(0)
      },
    },
    {
      command: 'CommandOrControl+Alt+T',
      action: () => {
        ipcMain.emit({ channel: IpcMessage.EndTask })
      },
    },
    {
      command: 'CommandOrControl+Alt+R',
      action: () => {
        Object.values(windows).forEach((window) => refresh(window))
      },
    },
  ]
  shortcuts.forEach((task) => {
    const ret = globalShortcut.register(task.command, task.action)
    if (!ret) {
      console.log('registration failed')
    }
    console.log(globalShortcut.isRegistered(task.command))
  })
}

app
  .whenReady()
  .then(createWindows)
  .then(createTray)
  .then(registerShortcuts)
  .catch(console.log)

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (Object.keys(windows).length === 0) createWindows()
})

app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+Alt+Q')
})
