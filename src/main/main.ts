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

// import MenuBuilder from './menu'
import IpcMessage from '../constants/ipcMessage'
import View from '../constants/view'
import { createTask, TaskData } from '../models/Task'
import { AppState, createAppState } from '../models/AppState'
import { createIpcMainInterface } from './IpcMainInterface'
import { Status } from '../constants/status'
import { resolveHtmlPath } from './util'

const DATA_FILE_PATH = `../log/${new Date().toISOString().slice(0, 10)}.txt`

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
    console.log = log.info.bind(log)
    console.error = log.error.bind(log)
  }
}

const windows: { [key: number]: BrowserWindow } = {}

const setView = async (view: View) => {
  appState.view = view
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
    ipcMain.send({
      channel: IpcMessage.SetSchedule,
      param: appState.schedule.toString(),
    })
    ipcMain.send({ channel: IpcMessage.SetActiveTask, param: taskData })
    appState.startActiveTask()
    setView(View.Timer)
  },
})

const onEndTask = (status: Status = Status.Successful) => {
  appState.completeActiveTask(status)
  const { activeTask: nextActiveTask } = appState
  ipcMain.send({
    channel: IpcMessage.SetActiveTask,
    param: nextActiveTask?.serialize(),
  })
  ipcMain.send({
    channel: IpcMessage.SetSchedule,
    param: appState.schedule.toString(),
  })
  setView(View.Task)
  if (!nextActiveTask) {
    ipcMain.send({
      channel: IpcMessage.SetScheduleOpen,
      param: true,
    })
  }
}

ipcMain.on({
  channel: IpcMessage.EndTask,
  callback: (_) => {
    onEndTask()
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
    const { view } = appState
    if (view === View.Timer) return
    appState.updateActiveTask()
    const { activeTask } = appState
    ipcMain.send({
      channel: IpcMessage.SetActiveTask,
      param: activeTask?.serialize(),
    })
  },
})

ipcMain.on({
  channel: IpcMessage.CueSetScheduleOpen,
  callback: async (_) => {
    appState.isScheduleOpen = !appState.isScheduleOpen
    if (appState.view === View.Timer) {
      Object.values(windows).forEach((window) =>
        window.setIgnoreMouseEvents(!appState.isScheduleOpen),
      )
    }
    ipcMain.send({
      channel: IpcMessage.SetScheduleOpen,
      param: appState.isScheduleOpen,
    })
  },
})

ipcMain.on({
  channel: IpcMessage.CueHydrate,
  callback: (_) => {
    const { schedule, activeTask, view, isScheduleOpen } = appState
    ipcMain.send({
      channel: IpcMessage.Hydrate,
      param: {
        rawSchedule: schedule.toString(),
        isScheduleOpen,
        view,
        activeTaskData: activeTask?.serialize(),
      },
    })
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

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets')

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths)
}

const createWindow: (display: Display) => BrowserWindow = (display) => {

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
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  })

  window.setAlwaysOnTop(true, 'screen-saver')
  window.setSkipTaskbar(true)

  window.setResizable(true)
  window.setSize(display.size.width, display.size.height)
  window.setResizable(false)
  window.setVisibleOnAllWorkspaces(true)
  window.setIgnoreMouseEvents(appState.view === View.Timer)

  window.loadURL(resolveHtmlPath('index.html'))
  // window.loadURL(`file://${path.join(__dirname, '../')}/index.html`)

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

  // const menuBuilder = new MenuBuilder(window)
  // menuBuilder.buildMenu()

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
    windows[display.id] = createWindow(display)
  })

  screen.on('display-added', (_, newDisplay) => {
    Object.entries(windows).forEach(([displayId, window]) => {
      const display = screen
        .getAllDisplays()
        .filter((display) => display.id.toString() === displayId)[0]
      display && window.setBounds(display.bounds)
    })
    if (windows[newDisplay.id]) return
    windows[newDisplay.id] = createWindow(newDisplay)
  })

  screen.on('display-removed', (_, oldDisplay) => {
    const window = windows[oldDisplay.id]
    window.destroy()
    delete windows[oldDisplay.id]
    Object.entries(windows).forEach(([displayId, window]) => {
      const display = screen
        .getAllDisplays()
        .filter((display) => display.id.toString() === displayId)[0]
      display && window.setBounds(display.bounds)
    })
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */
app.requestSingleInstanceLock()

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
  const iconPath = getAssetPath('icons/16x16.png') 
  tray = new Tray(iconPath)
  const menu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click() {
        app.exit()
      },
    },
  ])
  tray.setContextMenu(menu)
}

const registerShortcuts = () => {
  const shortcuts: { command: Electron.Accelerator; action: () => void }[] = [
    {
      command: 'CommandOrControl+Alt+Shift+Q',
      action: () => {
        app.relaunch()
      },
    },
    {
      command: 'Alt+space',
      action: () => {
        if (appState.view === View.Timer) {
          onEndTask(Status.Successful)
        }
      },
    },
    {
      command: 'Alt+Shift+space',
      action: () => {
        if (appState.view === View.Timer) {
          onEndTask(Status.Failed)
        }
      },
    },
    {
      command: 'CommandOrControl+Alt+R',
      action: () => {
        Object.values(windows).forEach((window) => refresh(window))
      },
    },
    {
      command: 'Alt+S',
      action: () => {
        ipcMain.emit({ channel: IpcMessage.CueSetScheduleOpen })
      },
    },
  ]
  shortcuts.forEach((task) => {
    const ret = globalShortcut.register(task.command, task.action)
    if (!ret) {
      console.log(`Registration failed for shortcut: ${task.command}`)
    } else {
      console.log(`Shortcut registered successfully: ${task.command}`)
    }
  })

  // Add a check to see if shortcuts are registered
  console.log('Registered shortcuts:', globalShortcut.isRegistered('Alt+space'))
}

app
  .whenReady()
  .then(() => {
    createWindows()
    createTray()
    app.on('activate', () => {
      if (Object.keys(windows).length === 0) createWindows()
    })
  })
  .then(() => {
    // Delay registering shortcuts
    setTimeout(registerShortcuts, 1000)
  })
  .catch((error) => {
    console.log(error)
  })

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll()
})
