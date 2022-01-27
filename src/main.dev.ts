/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  Display,
  globalShortcut,
  ipcMain,
  Menu,
  screen,
  shell,
  Tray,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import IpcMessages from './constants/ipcMessages';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const windows: { [key: number]: BrowserWindow } = {};

ipcMain.on(IpcMessages.CueStartTask, (_, task) => {
  Object.values(windows).forEach((window) => {
    window.webContents.send(IpcMessages.UpdateActiveTask, task);
    window.setIgnoreMouseEvents(true);
    window.webContents.send(IpcMessages.StartTask);
  });
});

ipcMain.on(IpcMessages.CueEndTask, () => {
  Object.values(windows).forEach((window) => {
    window.setIgnoreMouseEvents(false);
    window.webContents.send(IpcMessages.EndTask);
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  // require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow: (display: Display) => BrowserWindow = (display) => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  let window: BrowserWindow | null = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    show: false,
    enableLargerThanScreen: true,
    minimizable: false,
    movable: false,
    transparent: true,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.setAlwaysOnTop(true, 'screen-saver');
  window.setSkipTaskbar(true);

  window.setResizable(true);
  window.setSize(display.size.width, display.size.height);
  window.setResizable(false);

  window.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  window.webContents.on('did-finish-load', () => {
    if (!window) {
      throw new Error('"window" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      window.minimize();
    } else {
      window.show();
      window.focus();
    }
  });

  window.on('closed', () => {
    window = null;
  });

  const menuBuilder = new MenuBuilder(window);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  window.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  return window;
};

const createWindows = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  screen.getAllDisplays().forEach((display) => {
    console.log(display.id);
    windows[display.id] = createWindow(display);
  });

  screen.on('display-added', (_, newDisplay) => {
    windows[newDisplay.id] = createWindow(newDisplay);
  });

  screen.on('display-removed', (_, oldDisplay) => {
    delete windows[oldDisplay.id];
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let tray;

const createTray = () => {
  const iconPath = path.join(__dirname, '../assets/icons/16x16.png');
  tray = new Tray(iconPath);
  const menu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
};

const registerShortcuts = () => {
  const ret = globalShortcut.register('CommandOrControl+Alt+Q', () => {
    app.quit();
  });

  if (!ret) {
    console.log('registration failed');
  }

  console.log(globalShortcut.isRegistered('CommandOrControl+Alt+Q'));
};

app
  .whenReady()
  .then(createWindows)
  .then(createTray)
  .then(registerShortcuts)
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (Object.keys(windows).length === 0) createWindows();
});

app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+Alt+Q');
});
